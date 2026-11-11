"""Film strip of one scene over time (proves the moving parts move, and shows them).
usage: python tests/scene_frames.py <chrome.exe> <key> <phase> [weather] [frames] [gap_ms]"""
import sys, pathlib, io
from playwright.sync_api import sync_playwright
from PIL import Image

T = pathlib.Path(__file__).parent
exe, key, phase = sys.argv[1], sys.argv[2], sys.argv[3]
weather = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "-" else None
n = int(sys.argv[5]) if len(sys.argv) > 5 else 6
gap = int(sys.argv[6]) if len(sys.argv) > 6 else 1500
src = (T.parent / "src" / "seasonart.js").read_text(encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=exe)
    pg = b.new_page(viewport={"width": 864, "height": 136}, device_scale_factor=1)
    pg.set_content("<body style='margin:0'><div id=bar style='width:864px;height:136px;image-rendering:pixelated'></div></body>")
    pg.evaluate("(src)=>{ window.BdApi={Data:{load:()=>null,save(){}}}; const m={exports:null}; new Function('module',src)(m); window.S=m.exports; }", src)
    pg.evaluate("([k,p,w]) => { document.getElementById('bar').style.background = S.url(k,{phase:p,weather:w}) + ' center / cover no-repeat'; }", [key, phase, weather])
    shots = []
    for i in range(n):
        pg.wait_for_timeout(gap if i else 300)
        shots.append(Image.open(io.BytesIO(pg.screenshot())))
    b.close()
strip = Image.new("RGB", (864, 136 * n + 4 * (n - 1)), (17, 17, 17))
for i, im in enumerate(shots): strip.paste(im, (0, i * 140))
out = T / f"frames-{key}-{phase}{'-' + weather if weather else ''}.png"
strip.save(out)
diffs = sum(1 for a, c in zip(shots, shots[1:]) if a.tobytes() != c.tobytes())
print(f"saved {out}; {diffs}/{n - 1} frame pairs differ")
