"""Place the ElevenLabs narration on the timeline: cut each line out of the one take and drop it at its scene.

Line cut points come from the Scribe word timings, stored in reel.json audio.voLines.
Run from the project folder:  python3 sfx/make_vo.py  ->  public/vo.wav
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
reel = json.loads((ROOT / "reel.json").read_text())
src = ROOT / reel["audio"]["voice"]["source"]
lines = reel["audio"]["voLines"]
PAD = 0.06  # keep a little air around each line so consonants aren't clipped

parts, labels = [], []
for i, ln in enumerate(lines):
    a, b = max(0, ln["from"] - PAD), ln["to"] + PAD
    delay = int(round(ln["at"] * 1000))
    parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04}:d=0.04,adelay={delay}|{delay}[v{i}]")
    labels.append(f"[v{i}]")
graph = ";".join(parts) + ";" + "".join(labels) + f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={reel['duration']},atrim=0:{reel['duration']}[out]"
out = ROOT / "public" / reel["audio"]["vo"]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", graph, "-map", "[out]", "-ar", "44100", "-ac", "2", str(out)], check=True)
print(f"wrote {out} with {len(lines)} lines")
