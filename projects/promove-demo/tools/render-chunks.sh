#!/usr/bin/env bash
# Render video.mp4 in silent chunks (each retried on failure), join them, then mix in the music,
# sound effects and narration with the same levels and fades as src/Main.tsx. A long single render can stall
# in a starved browser tab; chunks make that a cheap retry.
set -euo pipefail
cd "$(dirname "$0")/.."
BROWSER=${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
TOTAL=$(node -e 'const r=require("./reel.json");console.log(Math.round(r.duration*r.fps))')
STEP=600
mkdir -p out/chunks
: > out/chunks/list.txt
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); ((b>=TOTAL)) && b=$((TOTAL-1))
  f=out/chunks/c$a.mp4
  for try in 1 2 3; do
    [ -s "$f" ] && break
    npx remotion render src/index.ts Main "$f" --codec=h264 --crf=18 --muted --frames=$a-$b --concurrency=2 --timeout=120000 $BROWSER > out/chunks/c$a.log 2>&1 && break
    rm -f "$f"; echo "chunk $a failed (try $try)"
  done
  [ -s "$f" ] || { echo "chunk $a failed"; exit 1; }
  echo "file 'c$a.mp4'" >> out/chunks/list.txt
  echo "chunk $a-$b ok"
done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/chunks/silent.mp4
DUR=$(node -e 'console.log(require("./reel.json").duration)')
MV=$(node -e 'console.log(require("./reel.json").audio.musicVol)')
SV=$(node -e 'console.log(require("./reel.json").audio.sfxVol)')
VV=$(node -e 'console.log(require("./reel.json").audio.voVol)')
ffmpeg -v error -y -i out/chunks/silent.mp4 -i public/music.wav -i public/sfx.wav -i public/vo.wav -filter_complex \
  "[1:a]atrim=0:$DUR,volume=$MV,afade=t=in:d=0.67,afade=t=out:st=$(echo "$DUR-2" | bc):d=2[m];[2:a]atrim=0:$DUR,volume=$SV[s];[3:a]atrim=0:$DUR,volume=$VV[v];[m][s][v]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest video.mp4
echo "wrote video.mp4"
