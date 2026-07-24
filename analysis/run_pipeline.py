"""Run the full analysis pipeline (steps 1-5) in order."""
import subprocess
import sys
from pathlib import Path

STEPS = [
    "pipeline/step01_download.py",
    "pipeline/step02_extract_osm.py",
    "pipeline/step03_demand.py",
    "pipeline/step04_candidates.py",
    "pipeline/step05_solve.py",
]

root = Path(__file__).resolve().parent
for step in STEPS:
    print(f"\n=== {step} ===", flush=True)
    r = subprocess.run([sys.executable, str(root / step)])
    if r.returncode != 0:
        raise SystemExit(f"{step} failed with exit code {r.returncode}")
print("\nPIPELINE COMPLETE — launch the app with: streamlit run analysis/app.py")
