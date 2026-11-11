"""The built-in theme parses in Chromium: every top-level rule block survives (invalid selectors are dropped silently by browsers)."""
import sys, pathlib, re
from playwright.sync_api import sync_playwright
T = pathlib.Path(__file__).parent
css = (T.parent / "src" / "theme.css").read_text(encoding="utf-8")
body = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
body = re.sub(r'url\("data:[^"]*"\)', "url()", body)
depth, blocks = 0, len(re.findall(r"@import[^;]*;", body))
for ch in body:
    if ch == "{":
        if depth == 0: blocks += 1
        depth += 1
    elif ch == "}": depth -= 1
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=sys.argv[1]); pg = b.new_page()
    pg.set_content("<html><head></head><body></body></html>")
    n = pg.evaluate("(css)=>{ const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s); return s.sheet.cssRules.length; }", css)
    b.close()
print(f"top-level blocks {blocks}, parsed rules {n}:", "PASS" if n == blocks else "FAIL")
sys.exit(0 if n == blocks else 1)
