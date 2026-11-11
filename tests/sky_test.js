// St Elijah's test for src/sky.js (the living sky): fake BdApi, fake document/window, counted timers. Run: node tests/sky_test.js
const assert = require("assert"), path = require("path");
// counted fake timers
const pending = new Map(); let tid = 0;
global.setTimeout = (fn, ms) => { const id = ++tid; pending.set(id, { fn, ms }); return id; };
global.clearTimeout = id => { pending.delete(id); };
const runTimers = () => { const all = [...pending]; pending.clear(); for (const [, t] of all) t.fn(); };
// fake DOM, just enough
const listeners = { window: {}, document: {} };
const on = who => (ev, fn) => { (listeners[who][ev] = listeners[who][ev] || new Set()).add(fn); };
const off = who => (ev, fn) => { listeners[who][ev]?.delete(fn); };
const fire = (who, ev) => [...(listeners[who][ev] || [])].forEach(f => f());
const count = () => Object.values(listeners).reduce((s, o) => s + Object.values(o).reduce((a, x) => a + x.size, 0), 0);
let anims = [];
const el = tag => {
    const e = { tag, children: [], style: {}, attrs: {}, parent: null, id: "", className: "",
        appendChild(c) { c.parent = e; e.children.push(c); return c; },
        remove() { if (e.parent) e.parent.children = e.parent.children.filter(x => x !== e); e.parent = null; e.removed = true; },
        setAttribute(k, v) { e.attrs[k] = v; },
        animate(frames, opt) { let res; const a = { frames, opt, state: "running", finished: new Promise(r => (res = r)), pause() { a.state = "paused"; }, play() { a.state = "running"; }, cancel() { a.state = "cancelled"; }, finish() { a.state = "finished"; res(a); } }; anims.push(a); return a; } };
    return e;
};
const body = el("body");
const overlay = (w, h, hiddenAncestor) => ({ closest: () => (hiddenAncestor ? {} : null), getBoundingClientRect: () => ({ width: w, height: h }) });
global.document = { hidden: false, body, createElement: el, addEventListener: on("document"), removeEventListener: off("document"), querySelector: () => null, querySelectorAll: () => overlays };
let overlays = []; // what Discord has under [role=dialog]/[role=menu] right now
global.window = { innerWidth: 1280, innerHeight: 720, addEventListener: on("window"), removeEventListener: off("window") };
const styles = new Map();
let saved = null;
global.BdApi = { Data: { load: () => saved, save: (_, k, v) => { saved = v; } }, DOM: { addStyle: (id, css) => styles.set(id, css), removeStyle: id => styles.delete(id) }, UI: { buildSettingsPanel: c => c } };
const Sky = require(path.join(__dirname, "..", "src", "sky.js"));
const layer = () => body.children.find(c => c.id === "cl3ar-sky");
const ok = (c, m) => { assert.ok(c, m); console.log("ok -", m); };
const tick = () => new Promise(r => setImmediate(r));

(async () => {
    // 1. start makes one layer on body (not in Discord's grid), with its style and one flight timer
    let s = new Sky({ name: "sky" });
    s.start();
    ok(layer() && layer().parent === body, "start puts the sky layer straight on <body>");
    ok(styles.has("sky") && /pointer-events:none/.test(styles.get("sky")) && /position:fixed/.test(styles.get("sky")), "the layer is fixed and never takes a click");
    ok(pending.size === 1 && [...pending.values()][0].ms >= 3000 && [...pending.values()][0].ms <= 8000, "the first flight is set for 3-8 s after start");
    // 2. the timer brings a flock and sets the next one (20-90 s, 'sometimes')
    runTimers();
    const birds = layer().children.length;
    ok(birds >= 1 && birds <= 5, `a flock of 1-5 birds flew (${birds})`);
    ok(pending.size === 1 && [...pending.values()][0].ms >= 20000 && [...pending.values()][0].ms <= 90000, "the next flight is 20-90 s later");
    ok(anims.length === birds * 2 && anims.every(a => a.state === "running"), "each bird has a path and a wing flap");
    // a bird that finishes its path is taken away
    anims[0].finish(); await tick();
    ok(layer().children.length === birds - 1, "a bird that has flown out is removed");
    // 3. losing focus: the timer goes away and every bird holds still; focus brings them back
    fire("window", "blur");
    ok(pending.size === 0, "blur: no flight timer is left running");
    ok(anims.filter(a => a.state === "running" || a.state === "paused").every(a => a.state === "paused"), "blur: every live bird is paused");
    ok(s.flyNow() === 0, "blur: no flock can start");
    fire("window", "focus");
    ok(pending.size === 1 && anims.filter(a => a.state === "running" || a.state === "paused").every(a => a.state === "running"), "focus: the birds fly on and the timer is back");
    document.hidden = true; fire("document", "visibilitychange");
    ok(pending.size === 0 && s.flyNow() === 0, "hidden window: no timer, no spawn");
    document.hidden = false; fire("document", "visibilitychange");
    ok(pending.size === 1, "visible again: the timer is back");
    // 4. stop clears everything, and callbacks that come late do nothing
    const live = anims.slice();
    s.stop();
    ok(!layer() && !styles.has("sky"), "stop removes the layer and its style");
    ok(pending.size === 0 && s.timers.size === 0, "stop leaves no timers");
    ok(count() === 0, "stop removes every listener");
    ok(live.every(a => a.state === "cancelled" || a.state === "finished"), "stop cancels every animation");
    live.forEach(a => a.finish()); await tick();
    ok(pending.size === 0 && !layer(), "a late 'finished' after stop does nothing");
    s.stop(); ok(true, "stop twice is harmless");
    // 5. started while hidden: nothing spawns until it is seen
    document.hidden = true; anims = [];
    s = new Sky({ name: "sky" }); s.start();
    ok(layer() && pending.size === 0 && s.flyNow() === 0 && anims.length === 0, "started hidden: no timer, no birds");
    document.hidden = false; fire("document", "visibilitychange");
    ok(pending.size === 1, "shown: the first flight is set");
    s.stop(); ok(pending.size === 0 && count() === 0, "stop again leaves nothing");
    // 5b. started while Discord is visible but not focused (the user in a game): nothing until focus
    document.hasFocus = () => false; anims = [];
    s = new Sky({ name: "sky" }); s.start();
    ok(layer() && pending.size === 0 && s.flyNow() === 0 && anims.length === 0, "started unfocused: no timer, no birds");
    fire("window", "focus");
    ok(pending.size === 1, "focused: the first flight is set");
    s.stop(); delete document.hasFocus;
    // 6. the switch off means no layer at all; the frequency setting changes the gap
    saved = { on: false, freq: "sometimes" };
    s = new Sky({ name: "sky" }); s.start();
    ok(!layer() && pending.size === 0 && count() === 0 && !styles.has("sky"), "switch off: no layer, no timer, no listener");
    const panel = s.getSettingsPanel();
    ok(panel.settings.find(x => x.id === "on").name === "Doves fly across the window" && panel.settings.find(x => x.id === "freq").options.length === 3, "settings: the switch and the how-often choice");
    panel.onChange(null, "on", true);
    ok(layer() && pending.size === 1, "switching it on from settings starts the sky");
    panel.onChange(null, "freq", "rare"); runTimers();
    ok([...pending.values()][0].ms >= 60000, "rare: the next flight is at least a minute away");
    s.stop(); ok(pending.size === 0 && !layer(), "clean after settings changes");
    // 7. only doves: four kinds, each sheet the full beat, white the most, a rock dove now and then
    ok(JSON.stringify(Sky.doves) === JSON.stringify(["white", "cream", "pearl", "rock"]), "the flock is doves only: white, cream, pearl grey, rock dove");
    const seq = Sky.seq;
    ok(seq[0] === "up" && seq.filter(x => x === "up").length >= 2 && seq.slice(-4).every(x => x === "glide"), "the beat: wing claps first, then a glide of 4+ steps");
    ok(["up", "mid", "down", "glide"].every(p => { const f = Sky.frame(p); return f.length === 15 && f.every(r => r.length === 20); }), "every pose is a whole 20x15 frame");
    const svg = Sky.sheetSvg("white");
    ok(svg.includes(`viewBox='0 0 ${20 * seq.length} 15'`) && /#fbfbf8/.test(svg) && /#ee8f9c/.test(svg) && /#e46a80/.test(svg), "the white dove's sheet holds every step, white plumage, pink beak and feet");
    ok(!/#4fae84/.test(svg) && /#4fae84/.test(Sky.sheetSvg("rock")), "only the rock dove has the green neck");
    const flock = new Sky({ name: "sky" }); saved = null; flock.start(); anims = [];
    let r = 11; const rand = () => (r = (r * 16807) % 2147483647) / 2147483647;
    flock.flyNow({ force: true, n: 400, rand });
    const kinds = {}; for (const c of layer().children) kinds[c.attrs["data-dove"]] = (kinds[c.attrs["data-dove"]] || 0) + 1;
    ok(Object.keys(kinds).every(k => Sky.doves.includes(k)) && kinds.white > 400 / 2 && kinds.rock > 0 && kinds.rock < kinds.cream + kinds.pearl, `mostly white, sometimes cream or grey, rarely a rock dove (${JSON.stringify(kinds)})`);
    ok(layer().children.every(c => c.style.width === "40px" || c.style.width === "60px"), "each dove is drawn at a whole 2x or 3x, never in between");
    ok(anims.filter(a => a.opt.iterations === Infinity).every(a => a.opt.easing === `steps(${seq.length})`) && new RegExp(`width:${seq.length * 100}%`).test(styles.get("sky")), "the wing beat steps through the whole sheet");
    // 8. the dialog guard only counts menus and windows that are really shown
    layer().children = []; anims = [];
    overlays = [overlay(1, 1), overlay(600, 400, true), overlay(0, 0)];
    ok(flock.flyNow({ n: 2, rand }) === 2, "a hidden, 1px or aria-hidden dialog does not keep the doves away");
    overlays.push(overlay(440, 320));
    ok(flock.flyNow({ n: 2, rand }) === 0, "an open, shown dialog or menu does");
    overlays = [];
    flock.stop();
    { const v = Sky.fleeVector(100, 100, 60, 100); ok(v.x > .5 && v.y < 0 && Math.abs(Math.hypot(v.x, v.y) - 1) < 1e-9, "a dove flees away from the cursor and upward"); }
    { const v = Sky.fleeVector(100, 100, 140, 100); ok(v.x < 0 && v.y < 0, "from the other side it flees the other way (and is drawn flipped)"); }
    ok(!(listeners.window.mousemove && listeners.window.mousemove.size), "no cursor listener left after stop()");
    console.log("all sky tests passed");
})().catch(e => { console.error(e); process.exit(1); });
