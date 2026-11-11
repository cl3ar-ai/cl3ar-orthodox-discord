"""Renders every scene (and the four times of day for the natural seasons) as a contact sheet, and proves the scene moves.
usage: python tests/season_preview.py <chrome.exe> [keys,comma,separated]"""
import sys, pathlib, json
from playwright.sync_api import sync_playwright

T = pathlib.Path(__file__).parent
src = (T.parent / "src" / "seasonart.js").read_text(encoding="utf-8")
only = sys.argv[2].split(",") if len(sys.argv) > 2 else None

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=sys.argv[1])
    pg = b.new_page(viewport={"width": 920, "height": 400}, device_scale_factor=1)
    pg.set_content("<html><body style='margin:0;background:#111;font:600 12px Segoe UI,sans-serif;color:#ddd'><div id=g style='display:grid;grid-template-columns:repeat(2,452px);gap:2px 8px;padding:6px'></div></body></html>")
    pg.evaluate("(src)=>{ window.BdApi={Data:{load:()=>null,save(){}}}; const m={exports:null}; new Function('module',src)(m); window.S=m.exports; }", src)
    rows = pg.evaluate("""(only) => {
        const out = [], keys = Object.keys(S.LABEL).filter(k => !only || only.includes(k));
        for (const k of keys) for (const ph of (["winter","spring","summer","autumn"].includes(k) ? ["dawn","day","dusk","night"] : ["day","night"])) out.push([k, ph]);
        return out; }""", only)
    pg.evaluate("""(rows) => { const g = document.getElementById('g');
        for (const [k, ph] of rows) { const d = document.createElement('div');
          d.innerHTML = `<div style='padding:4px 2px 2px'>${S.LABEL[k]} · ${ph}</div><div class=bar style="position:relative;width:432px;height:68px;display:flex;align-items:center;gap:6px;padding-left:12px;box-sizing:border-box;image-rendering:pixelated;
">
            ${'<span style="width:34px;height:34px;background:rgba(0,0,0,.38);box-shadow:inset 0 0 0 1px rgba(212,176,98,.35)"></span>'.repeat(5)}
            <span style="margin-left:10px;font:700 12px Segoe UI;color:#f1d27a;text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 3px #000">Wed, Nov 11 · 1:13 AM</span></div>`;
          g.appendChild(d);
          d.querySelector('.bar').style.background = 'linear-gradient(90deg,rgba(8,8,8,.55),rgba(8,8,8,.22) 55%,rgba(8,8,8,.08)),' + S.url(k,{phase:ph}) + ' center / cover no-repeat'; } }""", rows)
    pg.wait_for_timeout(400)
    h = pg.evaluate("document.body.scrollHeight")
    pg.set_viewport_size({"width": 920, "height": h})
    out = T / ("season-preview.png" if not only else "season-preview-%s.png" % "-".join(only)[:40])
    pg.screenshot(path=str(out), full_page=True)
    # does it move? two frames 1.2 s apart of the first bar must differ
    bar = pg.query_selector(".bar")
    a = bar.screenshot(); pg.wait_for_timeout(1200); c = bar.screenshot()
    print(json.dumps({"saved": str(out), "scenes": len(rows), "moves": a != c}))
    b.close()
