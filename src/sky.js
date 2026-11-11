/**
 * @name LivingSky
 * @author cl3ar-ai
 * @version 2.0.0
 * @description Now and then a small flock of white pixel doves flies in from the top left and out of the window, as the Holy Spirit came down as a dove: a few wing claps, then a glide. Drawn by the plugin itself, nothing downloaded; it holds still while Discord is in the background.
 */
const ID = "cl3ar-sky";
const W = 20, H = 15; // one frame, in art pixels

/* the dove, facing right, light from the top left. One body, and the near wing laid over it per pose.
   w plumage, a feather lines, s soft upper edge, d shadow / under edge, t flight-feather tips, e eye, p beak, f feet,
   h head, n neck green, m neck purple, b wing bars (h/n/m fall back to w and b to a, so only the rock dove shows them) */
const BODY = [
    "....................",
    "....................",
    "....................",
    "...............shs..",
    "..............shhhs.",
    "..............shhehp",
    "..............nmhhs.",
    "..tt....ssssnmmwwws.",
    ".ttsssswwwwwwwwwwws.",
    "tttsswwwwwwwwwwwwsd.",
    ".ttdswwwwwwwwwwwsd..",
    ".....dwwwwwwwwwsd...",
    ".......ddfdddddd....",
    "....................",
    "....................",
];
const WING = {
    // the clap: both wings high over the back, the far one a shadow just behind
    up: [
        "...dtt..............",
        "...dttw.............",
        "....dtww............",
        "....dtbww...........",
        ".....dtbww..........",
        ".....dtabww.........",
        "......dtabwww.......",
        "........aawww.......",
    ],
    // half way: the wing swept back over the body, tips trailing
    mid: [
        "", "", "", "", "", "",
        "......ttaww.........",
        "....ttaabbwww.......",
        "...tt.aaaawwww......",
        "......t.............",
    ],
    // the down beat: the near wing under the body, the far tip just showing over the back
    down: [
        "", "", "", "", "", "",
        "........dd..........",
        ".......dd...........",
        "",
        "..........awwws.....",
        ".........awbbws.....",
        "........tawbws......",
        "......ttaaws........",
        ".....tta............",
        "....tt..............",
    ],
    // the glide: wings held up in a shallow V, the far tip above the near one
    glide: [
        "", "", "",
        ".dd.................",
        "..ddttt.............",
        "....ttaaww..........",
        "......tabbwww.......",
        "........aawww.......",
    ],
};
/* the beat: clap, beat, clap, beat, then a long glide; one sheet frame per step, played with steps() */
const SEQ = ["up", "mid", "down", "mid", "up", "mid", "down", "glide", "glide", "glide", "glide", "glide"];
const frame = pose => BODY.map((row, y) => { const o = WING[pose][y] || ""; return [...row].map((c, x) => o[x] && o[x] !== "." ? o[x] : c).join(""); });
/* the flock is not clones: mostly white, now and then cream or pearl grey, rarely a rock dove; each 2x or 3x */
const DOVES = {
    white: { n: 6, c: { w: "#fbfbf8", a: "#e2e5eb", s: "#cdd2db", d: "#9aa1af", t: "#b4bac6", e: "#241c22", p: "#ee8f9c", f: "#e46a80" } },
    cream: { n: 2, c: { w: "#fbf3e0", a: "#ede1c4", s: "#dccdac", d: "#ab9c7e", t: "#c6b896", e: "#2a1e18", p: "#ec8c94", f: "#e06a78" } },
    pearl: { n: 2, c: { w: "#e9ecf2", a: "#d3d8e1", s: "#bcc2ce", d: "#878e9e", t: "#9ca3b2", e: "#1e1a22", p: "#e88896", f: "#dc6478" } },
    rock:  { n: 1, c: { w: "#b3bacb", a: "#9aa2b4", s: "#8b93a6", d: "#5d6475", t: "#3b404d", h: "#8a92a6", n: "#4fae84", m: "#9a6abf", b: "#2a2e3a", e: "#d8641e", p: "#d9a0a6", f: "#d65a70" } },
};
const colOf = (v, ch) => v.c[ch] || ({ h: v.c.w, n: v.c.w, m: v.c.w, b: v.c.a })[ch] || null;
/* the sprite sheet: the SEQ frames side by side, as an SVG */
const sheetSvg = v => {
    const d = {}, frames = {};
    SEQ.forEach((pose, n) => (frames[pose] || (frames[pose] = frame(pose))).forEach((row, y) => [...row].forEach((ch, x) => {
        const col = colOf(v, ch);
        if (col) d[col] = (d[col] || "") + `M${n * W + x} ${y}h1v1h-1z`;
    })));
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W * SEQ.length} ${H}' width='${W * SEQ.length}' height='${H}' shape-rendering='crispEdges'>${Object.keys(d).map(k => `<path fill='${k}' d='${d[k]}'/>`).join("")}</svg>`;
};
const SHEETS = {};
const sheet = name => SHEETS[name] || (SHEETS[name] = `url("data:image/svg+xml,${encodeURIComponent(sheetSvg(DOVES[name]))}")`);
const NAMES = Object.keys(DOVES), TOTAL = NAMES.reduce((s, k) => s + DOVES[k].n, 0);
const pickDove = R => { let r = R() * TOTAL; for (const k of NAMES) if ((r -= DOVES[k].n) < 0) return k; return NAMES[0]; };
/* an open menu or window of Discord's own: only one that is really shown counts (Discord keeps hidden ones, 1px "hiddenVisually" ones, aria-hidden ones) */
const OVERLAY = '[role="dialog"],[role="alertdialog"],[role="menu"]';
const shown = e => {
    if (e.closest?.(`[aria-hidden="true"],#${ID}`)) return false;
    const r = e.getBoundingClientRect?.();
    if (!r || r.width < 8 || r.height < 8) return false;
    const cs = globalThis.getComputedStyle?.(e);
    return !cs || (cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0");
};
const overlayOpen = () => [...(document.querySelectorAll?.(OVERLAY) || [])].some(shown);
const GAPS = { rare: [60, 180], sometimes: [20, 90], often: [10, 40] }; // seconds between flights
/* z-index 999: over Discord's page, under its own layers (popouts, modals, menus sit at 1000+); pointer-events:none, so it never takes a click */
const CSS = `#${ID}{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:999;contain:strict}
#${ID} .sky-b{position:absolute;left:0;top:0;overflow:hidden;will-change:transform}
#${ID} .sky-f{position:absolute;width:4px;height:2px;image-rendering:pixelated;will-change:transform,opacity}
#${ID} .sky-b i{display:block;width:${SEQ.length * 100}%;height:100%;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;will-change:transform}
@media (prefers-reduced-motion: reduce){#${ID}{display:none}}`;

module.exports = class LivingSky {
    constructor(meta) { this.name = meta?.name || "LivingSky"; this.gen = 0; this.timers = new Set(); this.anims = new Set(); this.layer = null; this.next = null; this.flock = new Set(); }
    load() { this.settings = Object.assign({ on: true, freq: "sometimes" }, BdApi.Data.load(this.name, "settings") || {}); }
    save() { BdApi.Data.save(this.name, "settings", this.settings); }
    static sheetSvg(name) { return sheetSvg(DOVES[name]); }
    static get doves() { return Object.keys(DOVES); }
    static get seq() { return SEQ.slice(); }
    static frame(pose) { return frame(pose); }
    static overlayOpen() { return overlayOpen(); }

    /* every timer goes through here: it is counted, cleared by stop(), and never runs for an old start() */
    later(fn, ms) { const gen = this.gen, id = setTimeout(() => { this.timers.delete(id); if (gen === this.gen) fn(); }, ms); this.timers.add(id); return id; }
    away() { return !!document.hidden || this.blurred || !!this.reduce?.matches; }
    start() {
        this.stop();
        this.load();
        if (!this.settings.on) return;
        const gen = this.gen;
        BdApi.DOM.addStyle(this.name, CSS);
        this.layer = document.createElement("div");
        this.layer.id = ID;
        this.layer.setAttribute("aria-hidden", "true");
        document.body.appendChild(this.layer); // a child of body, never inside Discord's layout
        this.blurred = document.hasFocus?.() === false; // started while the user is in another window: wait for focus
        this.reduce = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)") || null;
        this.onBlur = () => { if (gen !== this.gen) return; this.blurred = true; this.pause(); };
        this.onFocus = () => { if (gen !== this.gen) return; this.blurred = false; this.resume(); };
        this.onVis = () => { if (gen !== this.gen) return; if (document.hidden) this.pause(); else this.resume(); };
        this.onReduce = () => { if (gen !== this.gen) return; if (this.reduce?.matches) this.pause(); else this.resume(); };
        window.addEventListener("blur", this.onBlur);
        window.addEventListener("focus", this.onFocus);
        document.addEventListener("visibilitychange", this.onVis);
        this.reduce?.addEventListener?.("change", this.onReduce);
        // the cursor: a dove it comes near startles and flees fast, and its flock-mates scatter with it (checked once a frame at most)
        this.onMove = e => { if (gen !== this.gen) return; this.mx = e.clientX; this.my = e.clientY; if (!this.raf && this.flock.size) this.raf = requestAnimationFrame(() => { this.raf = 0; if (gen === this.gen) this.checkCursor(this.mx, this.my); }); };
        window.addEventListener("mousemove", this.onMove, { passive: true });
        this.wait = (3 + Math.random() * 5) * 1000; // the first flight comes soon
        if (!this.away()) this.schedule();
    }
    stop() {
        this.gen++;
        for (const id of this.timers) clearTimeout(id);
        this.timers.clear();
        this.next = null;
        for (const a of this.anims) { try { a.cancel(); } catch (_) {} }
        this.anims.clear();
        if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
        this.flock.clear();
        if (this.onBlur) {
            window.removeEventListener("blur", this.onBlur);
            window.removeEventListener("focus", this.onFocus);
            document.removeEventListener("visibilitychange", this.onVis);
            this.reduce?.removeEventListener?.("change", this.onReduce);
            window.removeEventListener("mousemove", this.onMove, { passive: true });
            this.onBlur = this.onFocus = this.onVis = this.onReduce = this.onMove = null;
        }
        this.reduce = null;
        this.layer?.remove();
        this.layer = null;
        try { BdApi.DOM.removeStyle(this.name); } catch (_) {}
    }
    gap() { const [a, b] = GAPS[this.settings.freq] || GAPS.sometimes; return (a + Math.random() * (b - a)) * 1000; }
    schedule() {
        if (this.next != null || !this.layer) return;
        const ms = this.wait ?? this.gap();
        this.wait = null;
        this.due = Date.now() + ms;
        this.next = this.later(() => { this.next = null; this.flyNow(); this.schedule(); }, ms);
    }
    /* in the background nothing runs: the flight timer is put away (its time left kept) and every bird holds still */
    pause() {
        if (this.next != null) { clearTimeout(this.next); this.timers.delete(this.next); this.next = null; this.wait = Math.max(1000, this.due - Date.now()); }
        for (const a of this.anims) { try { a.pause(); } catch (_) {} }
    }
    resume() {
        if (this.away() || !this.layer) return;
        for (const a of this.anims) { try { a.play(); } catch (_) {} }
        this.schedule();
    }
    /* one flock now: 1-5 doves (sometimes a lone one), each its own tint and size, its own line, speed and wave.
       opt: { force, n, dove, scale, rand } (force/dove/scale are for the tests and the mock) */
    flyNow(opt = {}) {
        if (!this.layer || (!opt.force && (this.away() || overlayOpen()))) return 0;
        const gen = this.gen, R = opt.rand || Math.random;
        const vw = window.innerWidth || 1280, vh = window.innerHeight || 720;
        const n = opt.n || (R() < .2 ? 1 : 2 + Math.floor(R() * 4));
        const y0 = vh * (.02 + R() * .12), y1 = vh * (.4 + R() * .45), dur0 = 10000 + R() * 6000; // the flock's line across
        const beat0 = 1000 + R() * 200; // one beat for the flock, each dove a little off it
        for (let i = 0; i < n; i++) {
            const name = opt.dove ? [].concat(opt.dove)[i % [].concat(opt.dove).length] : pickDove(R);
            const s = opt.scale ? [].concat(opt.scale)[i % [].concat(opt.scale).length] : R() < .35 ? 3 : 2, w = W * s, h = H * s;
            const b = document.createElement("div");
            b.className = "sky-b";
            b.style.width = w + "px"; b.style.height = h + "px";
            const fl = document.createElement("i");
            fl.style.backgroundImage = sheet(name);
            b.setAttribute("data-dove", name);
            b.appendChild(fl);
            this.layer.appendChild(b);
            const dx = -i * (18 + R() * 30), dy = (R() - .5) * 50 + (i % 2 ? 16 : -12) * Math.ceil(i / 2);
            const amp = 5 + R() * 14, waves = 1.5 + R() * 2, ph = R() * 6.28, dur = dur0 * (.88 + R() * .24), delay = i * (150 + R() * 450);
            const ax = -w - 30 + dx, bx = vw + 40 + w, frames = [];
            for (let k = 0; k <= 8; k++) {
                const t = k / 8, x = ax + (bx - ax) * t, y = y0 + dy + (y1 - y0) * (t * t * .7 + t * .3) + Math.sin(ph + t * waves * 6.28) * amp;
                frames.push({ transform: `translate(${Math.round(x)}px,${Math.round(y)}px)` });
            }
            const move = b.animate?.(frames, { duration: dur, delay, fill: "both", easing: "linear" });
            const flapMs = beat0 * (.92 + R() * .16);
            const flap = fl.animate?.([{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }], { duration: flapMs, iterations: Infinity, easing: `steps(${SEQ.length})`, delay: -R() * flapMs });
            for (const a of [move, flap]) if (a) this.anims.add(a);
            const d = { b, fl, move, flap, fleeing: false };
            const done = () => { if (gen !== this.gen) return; this.flock.delete(d); this.anims.delete(d.move); this.anims.delete(flap); try { flap?.cancel(); } catch (_) {} b.remove(); };
            d.done = done;
            this.flock.add(d);
            if (move?.finished) move.finished.then(() => { if (!d.fleeing) done(); }, () => {}); else this.later(() => { if (!d.fleeing) done(); }, dur + delay);
            if (this.away()) { try { move?.pause(); flap?.pause(); } catch (_) {} }
        }
        return n;
    }
    /* which way a startled dove flees: away from the cursor and upward, as a unit vector (tested) */
    static fleeVector(cx, cy, mx, my) {
        let x = cx - mx, y = cy - my; const l = Math.hypot(x, y) || 1;
        x /= l; y = y / l - .7; // birds lift as they flee
        const m = Math.hypot(x, y) || 1;
        return { x: x / m, y: y / m };
    }
    checkCursor(mx, my, R = 110) {
        if (this.away() || !this.layer) return 0;
        let scared = 0;
        for (const d of this.flock) {
            if (d.fleeing) continue;
            const r = d.b.getBoundingClientRect(); if (!r.width) continue;
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            if (Math.hypot(cx - mx, cy - my) > R) continue;
            this.scare(d, mx, my); scared++;
            for (const o of this.flock) { // the flock goes up with it, each a heartbeat later
                if (o.fleeing) continue;
                const q = o.b.getBoundingClientRect();
                if (Math.hypot(q.left - r.left, q.top - r.top) < 260) { o.fleeing = true; this.later(() => this.scare(o, mx, my, true), 60 + Math.random() * 180); }
            }
        }
        return scared;
    }
    /* the startle: a jump back with a burst of fast wing claps and a few feathers, then off out of the window, fast */
    scare(d, mx, my, mate = false) {
        if (!this.layer || !d.b.isConnected) return;
        d.fleeing = true;
        const r = d.b.getBoundingClientRect(), x0 = r.left, y0 = r.top, cx = x0 + r.width / 2, cy = y0 + r.height / 2;
        try { d.move?.cancel(); } catch (_) {}
        this.anims.delete(d.move);
        const v = LivingSky.fleeVector(cx, cy, mx, my), flip = v.x < 0 ? " scaleX(-1)" : "";
        const far = Math.max(window.innerWidth || 1280, window.innerHeight || 720) * 1.3, jx = (Math.random() - .5) * 10;
        const at = (x, y) => ({ transform: `translate(${Math.round(x)}px,${Math.round(y)}px)${flip}` });
        const ms = (mate ? 650 : 520) + Math.random() * 260;
        const kf = [at(x0, y0), at(x0 - v.x * 6 + jx, y0 + 5), at(x0 + v.x * 40, y0 + v.y * 40 - 6), at(x0 + v.x * far, y0 + v.y * far)];
        kf[1].offset = .1; kf[2].offset = .28;
        d.move = d.b.animate?.(kf, { duration: ms, easing: "cubic-bezier(.45,0,.9,.6)", fill: "both" }) || null;
        if (d.move) { this.anims.add(d.move); d.move.finished.then(() => d.done(), () => {}); } else this.later(() => d.done(), ms);
        try { d.flap.playbackRate = 3.5; } catch (_) {}
        if (!mate) this.feathers(cx, cy);
        return v;
    }
    feathers(cx, cy) {
        for (let k = 0; k < 4; k++) {
            const p = document.createElement("b");
            p.className = "sky-f";
            p.style.cssText = `left:${Math.round(cx)}px;top:${Math.round(cy)}px;background:${k % 2 ? "#ffffff" : "#d6dbe6"}`;
            this.layer.appendChild(p);
            const dx = (Math.random() - .5) * 46, dy = 26 + Math.random() * 34, ms = 900 + Math.random() * 700;
            const a = p.animate?.([{ transform: "translate(0,0) rotate(0deg)", opacity: 1 }, { transform: `translate(${dx * .6}px,${dy * .4}px) rotate(${dx * 3}deg)`, opacity: .9, offset: .4 },
                { transform: `translate(${dx}px,${dy}px) rotate(${dx * 6}deg)`, opacity: 0 }], { duration: ms, easing: "ease-out", fill: "forwards" });
            if (a) { this.anims.add(a); a.finished.then(() => { this.anims.delete(a); p.remove(); }, () => {}); } else this.later(() => p.remove(), ms);
        }
    }
    getSettingsPanel() {
        if (!this.settings) this.load();
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "switch", id: "on", name: "Doves fly across the window", note: "Now and then a small flock of white doves comes in at the top left and flies out of the window, a few wing claps and then a glide. Bring your cursor near and they startle and fly off fast. It holds still while Discord is in the background, and waits while a menu or window of Discord's is open.", value: this.settings.on },
                { type: "dropdown", id: "freq", name: "How often", value: this.settings.freq,
                  options: [{ label: "Rare (every one to three minutes)", value: "rare" }, { label: "Sometimes (every 20 to 90 seconds)", value: "sometimes" }, { label: "Often (every 10 to 40 seconds)", value: "often" }] },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.start(); },
        });
    }
};
