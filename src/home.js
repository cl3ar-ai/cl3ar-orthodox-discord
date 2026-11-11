/**
 * @name OrthodoxHome
 * @author cl3ar-ai
 * @version 1.0.0
 * @description The home screen becomes "Orthodox Today": the day's feast and saints, the fast, the Scripture readings (click to read them), and Orthodox news. Calendar from orthocal.info; world news from BBC and NPR. Only today's date is sent.
 */

// the church day for a civil date: Old Calendar (orthocal's Julian endpoint) or New Calendar (its Gregorian one); Pascha is Orthodox in both
const API = cal => `https://orthocal.info/api/${cal === "new" ? "gregorian" : "julian"}/`;
const CAL = (y, m, d, cal) => `${API(cal)}${y}/${m}/${d}/`;
const MONTH = (y, m, cal) => `${API(cal)}${y}/${m}/`;
const OFF = cal => cal === "new" ? 0 : 13;          // fixed feasts: civil date = church date + 13 days on the Old Calendar (1900-2099)
// lives of the saints: OrthodoxWiki (free, pan-Orthodox); when it has no page, a web search
const OW_API = "https://orthodoxwiki.org/api.php?action=query&format=json&redirects=1&titles=";
const OW_PAGE = t => "https://orthodoxwiki.org/" + encodeURIComponent(String(t).replace(/ /g, "_"));
const SEARCH = (q, what = "saint life") => "https://duckduckgo.com/?q=" + encodeURIComponent(`${q} Orthodox ${what}`);
const FEEDS = [
    // world news, updated through the day
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml", kind: "world" },
    { name: "NPR", url: "https://feeds.npr.org/1004/rss.xml", kind: "world" },
];
const OLD_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => { const s = String(u || "").replace(/'/g, "%27"); return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : ""; }; // an apostrophe in a name or slug stays a working link

/* Orthodox pixel icons for the card headings (St Alypius). One palette for the whole synod (St Photios' set): umber outline, gold, cinnabar,
   parchment, flame; light from the top-left. Every shape gets a 1px outline drawn around it automatically; glow, steam and fine chain stay bare. */
const PAL = {
    o: "#1b120c",                                                               // outline
    1: "#5a3a0c", 2: "#a8741c", 3: "#d9b24e", 4: "#f6e3a1", 5: "#fff6d0",       // gold
    R: "#3d0a0a", r: "#7e1c18", e: "#c8322a", E: "#e8603c",                     // cinnabar
    7: "#6b4a24", p: "#c9a66b", P: "#e8d3a0", q: "#fbf0d0",                     // parchment
    y: "#f08a1e", Y: "#ffb43a", z: "#fff4c0",                                   // flame
    f: "#8a5a3a", F: "#c88a5a", k: "#ecc090",                                   // flesh
    w: "#3a2414", W: "#6a4424", d: "#9a6a3a",                                   // wood
    b: "#14284a", B: "#2a4e86", c: "#4a86c4", C: "#9ccaf0",                     // blue
    g: "#1e3a16", G: "#3e6a26", h: "#74a640",                                   // green
    s: "#5a5a6a", S: "#9a9aac", x: "#dcdce8", X: "#ffffff",                     // white and silver
    l: "#5e3414", L: "#a4642a", m: "#d0943e", a: "#ecc878", A: "#b8964a",       // bread, lentils, beeswax
    n: "#c8b07a", N: "#8e7448",                                                 // sand
    v: "rgba(220,220,232,.5)", j: "#b08a3a", "+": "#ffffff",                    // steam, chain, glint
};
const BARE = new Set([..."yYzvj+"]);
const ring = rows => rows.map((r, y) => [...r].map((ch, x) => ch !== "." ? ch : [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const c = rows[y + dy]?.[x + dx]; return c && c !== "." && c !== "o" && !BARE.has(c); }) ? "o" : ".").join(""));
const over = (base, top) => base.map((r, y) => top[y] == null ? r : [...r].map((ch, x) => top[y][x] == null || top[y][x] === " " ? ch : top[y][x]).join(""));
const dots = (base, pts, ch) => base.map((r, y) => [...r].map((c, x) => pts.some(([px, py]) => px === x && py === y) ? ch : c).join(""));
const shiftRows = (rows, y0, dx) => rows.map((r, y) => y < y0 || !dx ? r : dx > 0 ? ".".repeat(dx) + r.slice(0, -dx) : r.slice(-dx) + ".".repeat(-dx));
// frames side by side in one SVG (a sprite sheet); runs of one colour become one rectangle
const sheet = frames => {
    const H = frames[0].length, W = frames[0][0].length, d = {};
    frames.forEach((rows, f) => ring(rows).forEach((r, y) => { for (let x = 0; x < W;) { let n = 1; while (r[x + n] === r[x]) n++; if (PAL[r[x]]) (d[r[x]] ||= []).push(`M${f * W + x} ${y}h${n}v1h-${n}z`); x += n; } }));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W * frames.length} ${H}' shape-rendering='crispEdges'>${Object.entries(d).map(([k, v]) => `<path fill='${PAL[k]}' d='${v.join("")}'/>`).join("")}</svg>`;
    return `url("data:image/svg+xml,${svg.replace(/[%#<>"]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase())}")`;
};
const ART = {};
// Saints commemorated: a saint in a gold halo, as on the icons: blue chiton with a gold stripe, red himation over the shoulder; a glint runs round the halo
{ const b = [".....444433.....", "....44444333....", "...444WWWW332...", "..444WddddW332..", ".4443WkkkkW3322.", ".443WkwkkwkW322.", ".433WkkFkkFW322.", ".333WkkkkkFW322.",
    ".332WWkFFkWW222.", ".332wWWWWWWw222.", ".EEeecWWWWcBBcB.", ".EEeeccWWccB3cB.", ".EeeeecccccB3cB.", ".EeeEeecccBB3BB.", ".EeeeEeeccBB3BB.", ".EeeeeEeecBB3BB."];
  ART.saints = { glow: "#f6e3a1", ms: 140, frames: [b, b, dots(b, [[7, 0], [8, 0]], "5"), dots(b, [[5, 0], [4, 1]], "5"), dots(b, [[3, 2], [2, 3]], "5"), dots(b, [[1, 4], [1, 5]], "5"), dots(b, [[1, 7], [1, 8]], "5"), b] }; }
// Readings: the Gospel open, a red ribbon; a page turns
{ const b = ["................", "................", "................", "...qqq....qqq...", "..qqqqqPPqqqqq..", "..qeeqqPPqpppq..", "..qepppPPqqqqq..", "..qqqqqPPqpppq..",
    "..qppppPPqqqqq..", "..qqqqqPPqppqq..", "..qpppqPPqqqqq..", "..PPPPPpPPPPPP..", ".433333er333332.", "..22222er22221..", ".......rR.......", "................"];
  const turn = deg => { const c = Math.cos(deg * Math.PI / 180), lift = 4.2 * Math.sin(deg * Math.PI / 180), xo = 8 + 6 * c, g = b.map(r => [...r]);
      const inP = (x, y) => { const cx = x + .5, cy = y + .5;
          if (Math.abs(xo - 8) < 1) return (x === 7 || x === 8) && cy >= 3.5 - lift && cy <= 11;
          const t = (cx - 8) / (xo - 8); return t >= 0 && t <= 1 && cy >= 3.5 - lift * t && cy <= 11 - lift * t; };
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (inP(x, y)) g[y][x] = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => inP(x + dx, y + dy)) ? "q" : "P";
      return g.map(r => r.join("")); };
  ART.readings = { glow: "#fbf0d0", ms: 150, frames: [b, b, turn(55), turn(90), turn(125), b] }; }
// Commemorations: beeswax candles in the sand tray; the flames flicker
{ const b = [".......Y........", ".......zY.......", ".......zY.......", ".......yy..Y....", ".......aA..zY...", "...Y...aA..zY...", "...zY..aA..yy...", "...zY..aA..aA...",
    "...yy..aA..aA...", "...aA..aA..aA...", "...aA..aA..aA...", ".nnaAnnaAnnaAnn.", ".nNnnnNnnnnNnnN.", ".32222222222221.", "..111111111111..", "................"];
  ART.names = { glow: "#ffb43a", ms: 130, frames: [b, over(b, ["       .Y", "       Yz", "       zY", "           .", "           Yz", "   .Y", "   Yz"]), b,
      over(b, ["       .", "       Yz", "", "           Y", "           zz", "   .", "   YY"])] }; }
// Fasting calendar: a bowl of lentils with a wooden spoon; steam rises
{ const b = ["................", "................", "................", "................", "............dW..", "...........dW...", "..........dW....", "...mLmLmLmdWL...",
    "..LmLlmLLmdlLm..", ".xCCCCCccccccBB.", ".cCcccccccccccB.", "..cCccccccccbB..", "...cccccccbBB...", "....BBBBBBBb....", ".....bbbbbb.....", "................"];
  const steam = f => { const pts = []; for (let y = 1; y <= 6; y++) { pts.push([5 + Math.round(Math.sin((y + f) * 1.3)), y]); if (y > 2) pts.push([8 + Math.round(Math.sin((y + f) * 1.3 + 2)), y]); } return dots(b, pts, "v"); };
  ART.calendar = { glow: "#9ccaf0", ms: 160, frames: [0, 1, 2, 3, 4].map(f => steam(f * 1.25)) }; }
// Feasts and fasts: the red lampada lit before the icons; it swings on its chains
{ const b = [".......jj.......", "......j..j......", ".....j....j.....", "....j......j....", "...j...Y....j...", "..j....zY....j..", "..544433333332..", "..rEEeeYzeeerR..",
    "..rEeeYzzYeerR..", "...rEeeYYeerR...", "....rreeeerR....", ".....RrrrrR.....", "......4332......", ".......32.......", ".......jj.......", "................"];
  ART.feasts = { glow: "#e8603c", ms: 230, frames: [b, shiftRows(b, 4, 1), b, shiftRows(b, 4, -1)] }; }
// Name days: the prosphora with its seal (cross and the four letters); a glint
{ const b = ["................", ".....aaaaaa.....", "...aaammmmmmL...", "..amllllllllmL..", ".aamlLLaaLLlmLL.", ".ammlLLaaLLlmLL.", ".ammlaaaaaalmLL.", ".ammlaaaaaalLLL.",
    ".ammlLLaaLLlLLl.", ".mmmlLLaaLLlLLl.", ".mmmllllllllLLl.", "..mmmmmmmmLLll..", ".LommmmmmLLllol.", "..LoommLLllool..", "...LLLLLllll....", "................"];
  ART.namedays = { glow: "#ecc878", ms: 150, frames: [b, b, dots(b, [[12, 2]], "+"), dots(dots(b, [[12, 2]], "z"), [[11, 2], [13, 2], [12, 1], [12, 3]], "+"), dots(b, [[12, 2]], "+"), b] }; }
// World news: the globe with the Cross (the world under Christ); it turns
{ const LAND = ["....##......###....#....", "...####....#####..###...", "..#####.....####...##...", "...###.......##.....#...", "....##......###.........",
    ".....#.......#.....##...", "............##....####..", "...##.............###...", "..####.................#", "...##...........##......"];
  const globe = off => Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
      if (y >= 1 && y <= 3 && (x === 7 || x === 8 || (y === 2 && (x === 6 || x === 9)))) return y === 2 && x === 6 ? "5" : x === 8 || x === 9 ? "3" : "4";
      const dx = x + .5 - 8, dy = y + .5 - 9, rr = 30.25 - dy * dy; if (dx * dx > rr) return ".";
      const u = Math.floor((Math.asin(dx / Math.sqrt(rr)) / Math.PI + .5) * 12 + off) % 24, lit = 1 - Math.hypot(x + .5 - 6.2, y + .5 - 7.2) / 8, land = LAND[y - 4]?.[u] === "#";
      if (x === 5 && y === 6) return "+";
      return land ? (lit > .55 ? "h" : lit > .25 ? "G" : "g") : (lit > .65 ? "C" : lit > .42 ? "c" : lit > .18 ? "B" : "b"); }).join(""));
  ART.world = { glow: "#9ccaf0", ms: 150, frames: [0, 3, 6, 9, 12, 15, 18, 21].map(globe) }; }
// Verse of the day: the dove of the Holy Spirit; its wings beat
{ const head = ["................", "................", "................", "................", "................", "...xX...........", "..xXXX..........", ".mxwXXx........."];
  const up = over(head, [, "............xX..", "...........xXS..", "..........xXXS..", ".........xXXS...", "...xX...xXXS....", "..xXXX.xXXS.....", ".mxwXXxXXSS....."]);
  const mid = over(head, [, , , , "...........xS...", "...xX....xXXS...", "..xXXX.xXXXS....", ".mxwXXxXXSS....."]);
  const tail = ["...xXXXXXXxxSS..", "....SxxxxxxSSSS.", ".....SSSSSS..SS.", "................", "................", "................", "................", "................"];
  const down = ["...xXXXXXXxxSS..", "....SxXXXSxSSSS.", ".....SxXXS...SS.", "......xXS.......", ".......S........", "................", "................", "................"];
  const f = (top, bot) => [...top, ...bot];
  ART.verse = { glow: "#ffffff", ms: 140, frames: [f(up, tail), f(mid, tail), f(over(head, [, , , , , , , ".mxwXXxxxxx....."]), down), f(mid, tail)] }; }
const ICONS = Object.fromEntries(Object.entries(ART).map(([k, v]) => [k, { ...v, n: v.frames.length, url: sheet(v.frames) }]));
const icon = id => ICONS[id] ? `<i class="h-ico hi-${id}" aria-hidden="true"></i>` : "";
const FOODS = [
    ["meat", "Meat", [".........", "....EEe..", "...EEeer.", "...eeeer.", "...reerr.", "..xrrrr..", ".xx......", ".Xx......", "........."]],
    ["dairy", "Dairy and eggs", [".........", "..xX.....", ".xXXx....", ".xXXx44..", "..xx4443.", ".3444333.", ".3423332.", ".3333222.", "........."]],
    ["fish", "Fish", [".........", ".........", ".........", "..CCcc.B.", ".CwCccBB.", ".cCccBB..", "..cBBb.B.", ".........", "........."]],
    ["wine", "Wine", [".........", ".4333332.", ".3EeeerR.", "..3eer2..", "...332...", "....3....", "...332...", "..43332..", "........."]],
    ["oil", "Oil", [".........", "....W....", "....x....", "...SxS...", "..S444S..", ".S43333S.", ".S43332S.", "..S322S..", "...SSS..."]],
].map(([k, label, rows]) => [k, label, sheet([rows])]);

module.exports = class OrthodoxHome {
    constructor(meta) { this.name = meta?.name || "OrthodoxHome"; this.openReadings = new Set(); }

    load() {
        const saved = BdApi.Data.load(this.name, "settings");
        this.settings = Object.assign({ home: true, world: true, panelNote: "today", calendar: "old" }, saved || {});
        if (saved?.calendar !== "old" && saved?.calendar !== "new") { this.settings.calendar = "old"; this.save(); } // the scene reads home.settings.calendar too
        this.collapsed = new Set(BdApi.Data.load(this.name, "collapsed") || []);
        this.lives = BdApi.Data.load(this.name, "lives") || {};
    }
    save() { BdApi.Data.save(this.name, "settings", this.settings); }
    cal() { return this.settings?.calendar === "new" ? "new" : "old"; }
    /* open a link in the user's own browser: Discord's window hands window.open on to the system browser (as BetterDiscord does itself) (tested) */
    static openOut(url) {
        const u = safeUrl(url);
        if (!u) return false;
        try { window.open(u, "_blank", "noopener,noreferrer"); } catch (_) { return false; }
        return true;
    }
    /* a saint's name as OrthodoxWiki titles it: ranks, years and companions left out (tested) */
    static saintNames(s) {
        let n = String(s || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").replace(/[.;:,\s]+$/, "").trim();
        const RANK = /^(?:our|holy|the|venerable|ven\.?|righteous|blessed|st\.?|sts\.?|saints?|great[- ]?martyrs?|greatmartyrs?|hieromartyrs?|virgin[- ]?martyrs?|new[- ]?martyrs?|martyrs?|prophet(?:ess)?|apostles?|evangelist|hierarch|confessor|unmercenar(?:y|ies)|godbearing|god-bearing|father|fathers|mother|mothers|relics(?: of)?|translation of the relics of)\s+/i;
        for (let i = 0; i < 8 && RANK.test(n); i++) n = n.replace(RANK, "");
        const out = [n];
        const lead = n.replace(/\s+and\s+(?:those\s+with\s+(?:him|her|them)|(?:his|her|their)\s+(?:\d+\s+)?(?:companions|disciples)|the\s+\d+\b.*)$/i, "");
        const RANKS = String.raw`(?:the\s+)?(?:wonderworker|bishop|archbishop|metropolitan|patriarch|pope|abbot|abbess|hegumen|enlightener|equal[- ]to[- ]the[- ]apostles)\b`;
        const of = lead.replace(new RegExp(String.raw`,\s*${RANKS}[^,]*?(?=\s+of\s|$)`, "i"), "");   // "John, Wonderworker of Kronstadt" -> "John of Kronstadt"
        const cut = lead.replace(new RegExp(String.raw`,\s*${RANKS}.*$`, "i"), "");                // "John Chrysostom, Archbishop of ..." -> "John Chrysostom"
        for (const v of [lead, of, cut]) if (v && !out.includes(v)) out.push(v);
        return out.filter((v, i) => v.length >= 3 && (i === 0 || v.includes(" ")));     // a bare first name alone would find the wrong saint
    }
    /* where a saint's life is read: the OrthodoxWiki page found for the name, else a web search (tested) */
    livesUrl(s, what) { return safeUrl(this.lives?.[s]) || SEARCH(OrthodoxHome.saintNames(s)[0] || String(s), what); }
    static livesFromWiki(json, saints) {
        const q = (typeof json === "string" ? JSON.parse(json) : json)?.query || {}, map = {};
        const hop = (list, t) => (list || []).find(r => r.from === t)?.to || t;
        const ok = new Set(Object.values(q.pages || {}).filter(p => p && p.missing === undefined && p.invalid === undefined && +p.pageid > 0).map(p => p.title));
        for (const s of saints || []) for (const n of OrthodoxHome.saintNames(s)) {
            const t = hop(q.redirects, hop(q.normalized, n));
            if (ok.has(t) && !/disambiguation/i.test(t)) { map[s] = OW_PAGE(t); break; }
        }
        return map;
    }
    /* look the names up on OrthodoxWiki once (one request for a day's saints); found pages are kept on this computer */
    async resolveLives(list, redraw) {
        this.lives ||= BdApi.Data.load(this.name, "lives") || {};
        const asked = this.livesAsked ||= new Set(), todo = [...new Set(list || [])].filter(s => !this.lives[s] && !asked.has(s)).slice(0, 15);
        if (!todo.length) return;
        todo.forEach(s => asked.add(s));
        try {
            const names = [...new Set(todo.flatMap(s => OrthodoxHome.saintNames(s)))].slice(0, 50);
            const found = OrthodoxHome.livesFromWiki(await this.get(OW_API + encodeURIComponent(names.join("|"))), todo);
            if (this.stopped || !Object.keys(found).length) return;
            const all = Object.entries({ ...this.lives, ...found });
            this.lives = Object.fromEntries(all.slice(-300)); BdApi.Data.save(this.name, "lives", this.lives);
            redraw?.();
        } catch (_) {}                                                              // the web-search links stay
    }
    saintLink(s, what) { return `<a class="h-life" href="${esc(this.livesUrl(s, what))}" title="${what === "feast" ? "About the feast" : "Read the life"} (opens in your browser)">${esc(s)}</a>`; }

    today() {
        const n = new Date();
        return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate(), key: n.toDateString(),
            label: n.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) };
    }
    async get(url) {
        const f = BdApi.Net?.fetch || globalThis.fetch;
        const r = await f(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) throw new Error(url + " " + r.status);
        return r.text();
    }
    /* feasts and fasts, computed locally. Old Calendar: civil = Julian + 13 days (1900-2099); New Calendar: fixed feasts on their civil dates.
       Pascha and the movable cycle are Orthodox (Julian Pascha) on both */
    static julianPascha(y) { // Meeus' Julian computus -> civil (Gregorian) Date
        const a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
        const m = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1;
        return new Date(y, m - 1, day + 13);
    }
    feasts(now = new Date(), cal = this.cal()) {
        const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), off = OFF(cal);
        const J = (y, m, d) => new Date(y, m - 1, d + off); // church date -> civil date
        const add = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
        const ev = [], fasts = [];
        for (const y of [day0.getFullYear() - 1, day0.getFullYear(), day0.getFullYear() + 1]) {
            const P = OrthodoxHome.julianPascha(y);
            for (const [m, d, name] of [[1, 6, "Theophany"], [2, 2, "Meeting of the Lord"], [3, 25, "Annunciation"], [6, 29, "Holy Apostles Peter and Paul"],
                [8, 6, "Transfiguration"], [8, 15, "Dormition of the Theotokos"], [8, 29, "Beheading of St John the Forerunner"], [9, 8, "Nativity of the Theotokos"],
                [9, 14, "Exaltation of the Holy Cross"], [10, 1, "Protection of the Theotokos"], [11, 21, "Entry of the Theotokos"], [12, 25, "Nativity of Christ"], [1, 1, "Circumcision; St Basil the Great"]])
                ev.push({ date: J(y, m, d), name });
            ev.push({ date: add(P, -7), name: "Entry into Jerusalem (Palm Sunday)" }, { date: P, name: "Holy Pascha" },
                { date: add(P, 39), name: "Ascension" }, { date: add(P, 49), name: "Pentecost" });
            fasts.push({ from: add(P, -48), to: add(P, -1), name: "Great Lent and Holy Week" },
                { from: add(P, 57), to: J(y, 6, 28), name: "Apostles' Fast" },
                { from: J(y, 8, 1), to: J(y, 8, 14), name: "Dormition Fast" },
                { from: J(y, 11, 15), to: J(y, 12, 24), name: "Nativity Fast" });
        }
        const days = dt => Math.round((dt - day0) / 864e5);
        const now_ = fasts.find(f => f.from <= day0 && day0 <= f.to && f.from < f.to);
        const upcoming = [...ev.map(e => ({ ...e, kind: "feast" })), ...fasts.filter(f => f.from < f.to).map(f => ({ date: f.from, name: f.name + " begins", kind: "fast" }))]
            .filter(e => days(e.date) >= 0).sort((a, b) => a.date - b.date).slice(0, 6).map(e => ({ ...e, in: days(e.date) }));
        return { current: now_ ? { name: now_.name, day: days(now_.from) * -1 + 1, left: days(now_.to) } : null, upcoming };
    }
    /* the fast of any day from the Typikon's general rules (used when orthocal cannot be reached). Levels: free, meat (dairy allowed), fish, oil (wine and oil), strict (tested) */
    static fastDay(date, cal = "old") {
        const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate()), y = d0.getFullYear(), wd = d0.getDay(), off = OFF(cal);
        const J = (yy, m, d) => new Date(yy, m - 1, d + off), P = OrthodoxHome.julianPascha(y), dp = Math.round((d0 - P) / 864e5);
        const same = (a, b) => a.getTime() === b.getTime(), inR = (a, b) => d0 >= a && d0 <= b, wf = wd === 3 || wd === 5, weekend = wd === 0 || wd === 6;
        const great = [[1, 6], [12, 25]].some(([m, d]) => same(d0, J(y, m, d)) || same(d0, J(y - 1, m, d)));
        const feast = [[2, 2], [3, 25], [6, 24], [6, 29], [8, 6], [8, 15], [9, 8], [10, 1], [11, 21]].some(([m, d]) => same(d0, J(y, m, d))) || dp === -7 || dp === 39;
        if (great) return "free";
        if (inR(J(y - 1, 12, 25), J(y, 1, 4)) || inR(J(y, 12, 25), J(y + 1, 1, 4))) return "free";            // Christmastide
        if ([[1, 5], [8, 29], [9, 14]].some(([m, d]) => same(d0, J(y, m, d)))) return same(d0, J(y, 9, 14)) ? "oil" : "strict"; // Theophany eve, Beheading strict; Exaltation with oil
        if (dp >= -69 && dp <= -64) return "free";                                                          // week of the Publican and the Pharisee
        if (dp >= -55 && dp <= -49) return "meat";                                                          // Cheesefare week
        if (dp >= 0 && dp <= 6) return "free";                                                              // Bright Week
        if (dp >= 50 && dp <= 55) return "free";                                                            // Trinity week
        if (dp >= -48 && dp <= -1) {                                                                        // Great Lent and Holy Week
            if (same(d0, J(y, 3, 25)) || dp === -7) return "fish";
            if (dp >= -6) return dp === -1 ? "oil" : "strict";
            return weekend ? "oil" : "strict";
        }
        if (inR(new Date(P.getFullYear(), P.getMonth(), P.getDate() + 57), J(y, 6, 28))) return feast ? "fish" : wf ? "strict" : "fish"; // Apostles' Fast
        if (inR(J(y, 8, 1), J(y, 8, 14))) return same(d0, J(y, 8, 6)) ? "fish" : weekend ? "oil" : "strict";    // Dormition Fast
        if (inR(J(y, 11, 15), J(y, 12, 24)) || inR(J(y - 1, 11, 15), J(y - 1, 12, 24))) {                         // Nativity Fast
            const late = inR(J(y - 1, 12, 20), J(y - 1, 12, 24)) || inR(J(y, 12, 20), J(y, 12, 24));
            if (feast) return "fish";
            if (late) return weekend ? "oil" : "strict";
            return wf ? "strict" : wd === 1 ? "oil" : "fish";
        }
        if (wf) return feast ? "fish" : "strict";
        return "free";
    }
    /* a day of orthocal's month list -> the calendar's level, the same source as the Fast line at the top (tested) */
    static levelOf(x) {
        if (!x || !x.fast_level) return "free";                                    // no fast (an exception on a free day changes nothing)
        const ex = +x.fast_exception || 0, t = String(x.fast_exception_desc || "").toLowerCase();
        if (ex === 11 || /fast free/.test(t)) return "free";
        if (ex === 7 || /meat fast|cheese|dairy/.test(t)) return "meat";
        if (/fish(?! roe)/.test(t)) return "fish";
        if (/oil/.test(t)) return "oil";                                            // wine and oil (also "strict fast (wine and oil)", roe or caviar)
        return "strict";
    }
    /* orthocal's month list for a civil month -> one entry per civil day, or null if it does not fit (tested) */
    static parseMonth(json, y, m) {
        let a; try { a = typeof json === "string" ? JSON.parse(json) : json; } catch (_) { return null; }
        if (!Array.isArray(a) || a.length !== new Date(y, m, 0).getDate()) return null;
        return a.map(x => ({ lv: OrthodoxHome.levelOf(x), fast: [x.fast_level_desc, x.fast_exception_desc].filter(t => t && t !== "No overrides").join(" — "),
            church: x.month && x.day ? `${x.day} ${OLD_MONTHS[x.month - 1]}` : "", feasts: (x.feasts || []).slice(0, 4), saints: (x.saints || []).slice(0, 8) }));
    }
    async loadMonth(y, m) {
        const k = `${this.cal()}:${y}-${m}`;
        if ((this.months ||= new Map()).has(k)) return;
        this.months.set(k, null);                                                   // asked once
        try {
            const days = OrthodoxHome.parseMonth(await this.get(MONTH(y, m, this.cal())), y, m);
            if (!days || this.stopped) return;
            this.months.set(k, days); this.redrawCal();
        } catch (_) {}                                                              // the Typikon's general rules stay
    }
    redrawCal() { const el = document.querySelector("#cl3ar-home .h-cal"); if (el) el.outerHTML = this.calendarHtml(); }
    calendarHtml() {
        const now = new Date(), base = new Date(now.getFullYear(), now.getMonth() + (this.calOffset || 0), 1), cal = this.cal();
        const y = base.getFullYear(), m = base.getMonth() + 1, month = this.months?.get(`${cal}:${y}-${m}`);
        if (!month && this.loadMonth && typeof document !== "undefined") setTimeout(() => this.loadMonth(y, m), 0);
        const days = new Date(y, m, 0).getDate(), lead = (base.getDay() + 6) % 7;
        const NAME = { free: "No fast", meat: "No meat (dairy allowed)", fish: "Fish, wine and oil", oil: "Wine and oil", strict: "Strict fast" };
        let cells = "";
        for (let i = 0; i < lead; i++) cells += `<span class="c-d c-pad"></span>`;
        for (let d = 1; d <= days; d++) {
            const dt = new Date(y, m - 1, d), lv = month?.[d - 1]?.lv || OrthodoxHome.fastDay(dt, cal), today = dt.toDateString() === now.toDateString();
            cells += `<span class="c-d c-${lv}${today ? " c-today" : ""}${this.calDay === d ? " c-sel" : ""}" data-day="${d}" role="button" tabindex="0" title="${dt.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}: ${NAME[lv]}">${d}</span>`;
        }
        let info = "";
        if (this.calDay && this.calDay <= days) {
            const d = this.calDay, dt = new Date(y, m - 1, d), x = month?.[d - 1], lv = x?.lv || OrthodoxHome.fastDay(dt, cal);
            const feasts = x ? x.feasts : this.feasts(new Date(y, m - 1, d), cal).upcoming.filter(e => e.in === 0).map(e => e.name);
            if (x && this.resolveLives) this.resolveLives([...x.feasts, ...x.saints], () => this.redrawCal());
            info = `<div class="c-info"><b>${esc(dt.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }))}</b>${cal === "old" && x?.church ? ` <span class="h-muted">· ${esc(x.church)} (Old Calendar)</span>` : ""}
<div><i class="c-dot c-${lv}"></i>${NAME[lv]}${x?.fast && lv !== "free" ? ` <span class="h-muted">· ${esc(x.fast)}</span>` : ""}</div>${feasts.length ? `<div class="c-feast">${feasts.map(f => this.saintLink(f, "feast")).join(" · ")}</div>` : ""}${x?.saints?.length ? `<ul class="h-saints">${x.saints.map(s => `<li>${this.saintLink(s)}</li>`).join("")}</ul>` : month ? "" : `<div class="h-muted">Saints of the day load from orthocal.info.</div>`}</div>`;
        }
        return `<div class="h-cal"><div class="c-head"><button type="button" data-cal="-1" title="Previous month">‹</button><b>${esc(base.toLocaleDateString(undefined, { month: "long", year: "numeric" }))}</b><button type="button" data-cal="1" title="Next month">›</button></div>
<div class="c-grid">${["M", "T", "W", "T", "F", "S", "S"].map(w => `<span class="c-w">${w}</span>`).join("")}${cells}</div>${info}
<div class="c-legend">${Object.entries(NAME).map(([k, v]) => `<span><i class="c-${k}"></i>${v}</span>`).join("")}</div>
<div class="h-muted c-note">${month ? `Fasts from orthocal.info (${cal === "new" ? "New" : "Old"} Calendar), the same as the Fast line above` : "From the Typikon's general rules"}; click a day for its fast and saints. Follow your spiritual father and parish custom.</div></div>`;
    }
    /* the liturgical colour of the season (Russian usage), used as the Home page's accent (tested) */
    static litColour(key) {
        const C = { gold: "#d4b062", white: "#e8dcb8", blue: "#6f9ad8", red: "#d8483a", green: "#6aae5a", purple: "#9a6ab8", dark: "#8a6aa0" };
        const map = { pascha: "red", nativity: "white", theophany: "white", ascension: "white", transfiguration: "white", meeting: "blue", annunciation: "blue",
            dormition: "blue", nativityTheotokos: "blue", entry: "blue", protection: "blue", exaltation: "purple", lent: "dark", holyweek: "dark",
            pentecost: "green", palm: "green", peterpaul: "gold", nativityfast: "dark", apostlesfast: "dark", dormitionfast: "dark" };
        return C[map[key] || "gold"];
    }
    /* which service of the day it is now (tested) */
    static hourOf(h) {
        return h < 4 ? "Midnight Office" : h < 7 ? "Matins" : h < 9 ? "First Hour" : h < 12 ? "Third Hour" : h < 15 ? "Sixth Hour" : h < 18 ? "Ninth Hour" : h < 21 ? "Vespers" : "Compline";
    }
    /* one verse to carry through the day: the first verse of the Gospel (tested) */
    static verseOf(day) {
        const r = (day?.readings || []).find(r => /gospel/i.test(r.source)) || (day?.readings || [])[0];
        const v = r?.text?.find(v => v.t && String(v.t).trim().length > 20);
        return v ? { text: String(v.t).trim(), ref: r.display } : null;
    }
    /* the greeting of the season, or "" (tested) */
    static greeting(now = new Date(), cal = "old") {
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), y = d0.getFullYear(), off = OFF(cal);
        const dp = Math.round((d0 - OrthodoxHome.julianPascha(y)) / 864e5), J = (yy, m, d) => new Date(yy, m - 1, d + off);
        if (dp >= 0 && dp < 39) return "Christ is Risen! Truly He is Risen!";
        if (dp >= 39 && dp < 48) return "Christ is Ascended! From earth to heaven!";
        if ((d0 >= J(y - 1, 12, 25) && d0 < J(y, 1, 6)) || d0 >= J(y, 12, 25)) return "Christ is Born! Glorify Him!";   // Nativity to Theophany's eve
        if (d0 >= J(y, 1, 6) && d0 < J(y, 1, 15)) return "Christ is Baptized! In the river Jordan!";                     // to Theophany's leave-taking
        return "";
    }
    /* friends whose first name is the name of a saint commemorated today (tested) */
    static nameDays(saints, friends) {
        const STOP = new Set(["saint", "saints", "martyr", "martyrs", "hieromartyr", "virgin", "holy", "venerable", "ven", "st", "sts", "our", "father", "fathers", "mother", "the", "of", "and",
            "righteous", "prophet", "apostle", "apostles", "blessed", "great", "new", "unmercenary", "unmercenaries", "bishop", "archbishop", "confessor", "monk", "nun", "abbess", "abbot",
            "evangelist", "wonderworker", "fool", "for", "christ", "equal", "to", "his", "her", "their", "with", "who", "in", "at", "on", "from", "child", "children", "deacon", "priest",
            "presbyter", "patriarch", "metropolitan", "emperor", "empress", "king", "queen", "prince", "princess", "translation", "relics", "icon", "mother of god", "theotokos", "all"]);
        const names = new Map();
        for (const s of saints || []) for (const w of String(s).split(/[^A-Za-zÀ-ž]+/)) {
            const k = w.toLowerCase();
            if (w.length >= 3 && /^[A-ZÀ-Þ]/.test(w) && !STOP.has(k) && !names.has(k)) names.set(k, s);
        }
        const out = [];
        for (const f of friends || []) {
            const first = String(f.name || "").split(/[^A-Za-zÀ-ž]+/).find(Boolean) || "";
            const saint = names.get(first.toLowerCase());
            if (first.length >= 3 && saint) out.push({ id: f.id, name: first, saint });
        }
        return out;
    }
    friendsList() {
        try {
            const R = BdApi.Webpack.getStore("RelationshipStore"), U = BdApi.Webpack.getStore("UserStore");
            return (R?.getFriendIDs?.() || []).map(id => { const u = U?.getUser?.(id); return { id, name: u?.globalName || u?.username || "" }; });
        } catch (_) { return []; }
    }
    /* what the day's fast allows, from orthocal's fast text (tested) */
    static fastFoods(text) {
        const t = String(text || "").toLowerCase(), all = v => ({ meat: v, dairy: v, fish: v, wine: v, oil: v });
        if (!t || /no fast|fast free|fast-free/.test(t)) return all(true);
        if (/cheese|meat fast|dairy, eggs|dairy and eggs/.test(t)) return { ...all(true), meat: false };
        const f = all(false);
        if (/strict|xerophagy|total/.test(t)) return f;
        if (/wine/.test(t)) f.wine = true;
        if (/oil/.test(t)) f.oil = true;
        if (/fish(?! roe)/.test(t)) f.fish = true;
        if (/roe|caviar/.test(t)) f.roe = true;
        return f;
    }
    foodsHtml(text) {
        const ok = OrthodoxHome.fastFoods(text);
        return `<span class="h-foods">${FOODS.map(([k, label]) => `<i class="h-food hf-${k}${ok[k] ? "" : " no"}" title="${label}: ${ok[k] ? "allowed" : "not today"}"></i>`).join("")}${ok.roe ? `<span class="h-muted">(fish roe allowed)</span>` : ""}</span>`;
    }
    /* the commemoration book (pomyannik): names of the living and the departed, kept on this computer only (tested) */
    names() { return this.pom ||= Object.assign({ living: [], departed: [] }, BdApi.Data.load(this.name, "names") || {}); }
    addName(list, name) {
        const n = String(name || "").replace(/\s+/g, " ").trim().slice(0, 60), L = this.names()[list];
        if (!n || !L || L.includes(n) || L.length >= 60) return false;
        L.push(n); BdApi.Data.save(this.name, "names", this.pom); return true;
    }
    delName(list, i) { const L = this.names()[list]; if (!L || !L[i]) return false; L.splice(i, 1); BdApi.Data.save(this.name, "names", this.pom); return true; }
    namesHtml() {
        const N = this.names(), col = (k, title, prayer) => `<div class="p-col"><div class="p-h">${title}</div>
<ul class="p-list">${N[k].map((n, i) => `<li><i class="p-candle${k === "departed" ? " p-dep" : ""}"></i><span>${esc(n)}</span><button type="button" class="p-del" data-del="${k}:${i}" title="Remove">×</button></li>`).join("") || `<li class="h-muted">No names yet.</li>`}</ul>
<div class="p-add"><input type="text" maxlength="60" placeholder="Add a name" data-list="${k}"><button type="button" data-add="${k}">Add</button></div>
<div class="h-muted p-pr">${prayer}</div></div>`;
        return `<div class="h-pom">${col("living", "For the living", "Save, O Lord, and have mercy on Thy servants" + (N.living.length ? ": " + N.living.map(esc).join(", ") : "") + ".")}${col("departed", "For the departed", "Give rest, O Lord, to the souls of Thy departed servants" + (N.departed.length ? ": " + N.departed.map(esc).join(", ") : "") + ", and make their memory eternal.")}</div>`;
    }
    namesClick(e) {
        const b = e.target.closest("button");
        if (!b) return false;
        if (b.dataset.del) { const [k, i] = b.dataset.del.split(":"); this.delName(k, +i); }
        else if (b.dataset.add) { const inp = b.parentElement.querySelector("input"); if (!this.addName(b.dataset.add, inp?.value)) return true; }
        else return false;
        this.redrawNames(b.dataset.add); return true;
    }
    redrawNames(focusList) {
        const el = document.querySelector("#cl3ar-home .h-pom");
        if (!el) return;
        el.outerHTML = this.namesHtml();
        if (focusList) document.querySelector(`#cl3ar-home .h-pom input[data-list="${focusList}"]`)?.focus();
    }
    prayers(now = new Date()) {
        const h = now.getHours();
        const trisagion = ["Holy God, Holy Mighty, Holy Immortal, have mercy on us. (thrice)",
            "Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.",
            "O Most Holy Trinity, have mercy on us. O Lord, cleanse us from our sins. O Master, pardon our transgressions. O Holy One, visit and heal our infirmities, for Thy name's sake.",
            "Lord, have mercy. (thrice)",
            "Our Father, which art in heaven, hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil."];
        if (h >= 18 || h < 4) return { title: "Evening prayers", lines: [...trisagion, "Lord, now lettest thou thy servant depart in peace, according to thy word: for mine eyes have seen thy salvation, which thou hast prepared before the face of all people; a light to lighten the Gentiles, and the glory of thy people Israel.", "Into Thy hands, O Lord, I commend my spirit. Bless me, save me, and grant me eternal life. Amen."] };
        if ((h >= 11 && h < 14) || h === 17) return { title: "Prayer before meals", lines: ["The eyes of all look to Thee with hope, O Lord, and Thou givest them their food in due season; Thou openest Thy hand and fillest every living thing with Thy good pleasure.",
            "Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.", "Lord, have mercy. (thrice)", "O Christ our God, bless the food and drink of Thy servants, for Thou art holy, always, now and ever, and unto the ages of ages. Amen."] };
        if (h === 14) return { title: "Prayer after meals", lines: ["We thank Thee, O Christ our God, that Thou hast satisfied us with Thine earthly gifts; deprive us not of Thy heavenly Kingdom, but as Thou camest among Thy disciples, O Saviour, and gavest them peace, come to us and save us.",
            "Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.", "Lord, have mercy. (thrice)"] };
        return { title: "Prayer during the day", lines: ["Lord Jesus Christ, Son of God, have mercy on me, a sinner.", ...trisagion.slice(0, 2)] };
    }

    /* pure parsers (tested) */
    parseDay(json) {
        const d = typeof json === "string" ? JSON.parse(json) : json;
        return {
            title: (d.titles || [])[0] || d.summary_title || "",
            tone: d.tone || null,
            feasts: d.feasts || [],
            old: d.month && d.day ? `${d.day} ${OLD_MONTHS[d.month - 1]}` : "",
            fast: [d.fast_level_desc, d.fast_exception_desc].filter(Boolean).join(" — "),
            saints: d.saints || [],
            lives: (d.stories || []).map(s => ({ title: s.title || "", text: String(s.story || "").replace(/<\/p>\s*<p[^>]*>/g, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim() })).filter(s => s.text),
            readings: (d.readings || []).map(r => ({
                source: r.source || "", display: r.display || "",
                text: (r.passage || []).map(v => ({ v: v.verse, t: v.content, p: !!v.paragraph_start })),
            })),
        };
    }
    parseFeed(xml, feed) {
        const doc = new DOMParser().parseFromString(xml, "text/xml");
        return [...doc.querySelectorAll("item")].slice(0, 8).map(it => ({
            kind: feed.kind, src: feed.name, title: it.querySelector("title")?.textContent?.trim() || "",
            link: safeUrl(it.querySelector("link")?.textContent?.trim()),
            date: Date.parse(it.querySelector("pubDate")?.textContent || "") || 0,
        })).filter(i => i.title && i.link);
    }

    async refreshData() {
        const t = this.today(); this.dayKey = t.key;
        const cache = BdApi.Data.load(this.name, "day");
        const key = (this.cal() === "new" ? "gregorian:" : "julian:") + t.key;
        if (cache?.key === key && cache.day) this.day = cache.day;
        else {
            try { this.day = this.parseDay(await this.get(CAL(t.y, t.m, t.d, this.cal()))); BdApi.Data.save(this.name, "day", { key, day: this.day }); }
            catch (e) { this.dayError = String(e.message || e); }
        }
        this.render();
        if (this.day) this.resolveLives([...this.day.feasts, ...this.day.saints], () => this.render());
        if (!this.settings.world) return;
        const items = [];
        for (const f of FEEDS) {
            if (!this.settings.world) continue; try { items.push(...this.parseFeed(await this.get(f.url), f)); } catch (_) {} }
        if (this.stopped) return;
        items.sort((a, b) => b.date - a.date);
        this.news = items;
        this.render();
    }

    html() {
        const t = this.today(), d = this.day;
        // right-hand button column; more buttons go here in order under Friends
        // a folded card says how much it holds, so it never looks empty
        const sec = (id, title, n) => { const c = this.collapsed.has(id); return [`</section><section class="h-card" data-card="${id}"><h2 class="h-sec" data-s="${id}" title="${c ? "Show" : "Fold"}"><span class="h-arrow">${c ? "▸" : "▾"}</span> ${icon(id)}${esc(title)}${c && n ? ` <span class="h-count">(${n})</span>` : ""}</h2>`, c]; };
        const sc = globalThis.__cl3arScene;
        const banner = this.bannerHtml();
        const parts = [banner + `<div class="h-actions"><button class="h-friends" type="button">Friends</button><button class="h-status" type="button">Status</button></div>
<div class="h-date">${this.cal() === "new" ? `${esc(t.label)} <span class="h-muted">(New Calendar)</span>` : `${d?.old ? `${esc(d.old)} <span class="h-muted">(Old Calendar)</span> · ` : ""}${esc(t.label)}`}</div>`];
        if (!d) parts.push(`<div class="h-muted">${this.dayError ? "Could not load today's calendar." : "Loading today's calendar…"}</div><div class="h-grid"><section class="h-card h-hidden">`);
        else {
            const greet = OrthodoxHome.greeting(new Date(), this.cal());
            if (greet) parts.push(`<div class="h-greet">${esc(greet)}</div>`);
            parts.push(`<h1 class="h-title">${esc(d.title)}${d.tone ? ` <span class="h-muted">· Tone ${esc(d.tone)}</span>` : ""}</h1>`);
            if (d.feasts.length) parts.push(`<div class="h-feast">${d.feasts.map(f => this.saintLink(f, "feast")).join(" · ")}</div>`);
            const vs = OrthodoxHome.verseOf(d);
            if (vs) parts.push(`<div class="h-verse">${icon("verse")}<span>“${esc(vs.text)}” <span class="h-muted">— ${esc(vs.ref)}</span></span></div>`);
            parts.push(`<div class="h-row h-fastrow"><b>${d.fast ? "Fast" : "No fast"}</b> ${esc(d.fast === "Fast" ? "no meat, dairy, fish, wine or oil" : d.fast)} ${this.foodsHtml(d.fast)}</div>`);
            parts.push(`<div class="h-grid"><section class="h-card h-hidden">`);
            { const p = this.prayers(); const [h, c] = sec("prayers", p.title); parts.push(h); if (!c) parts.push(`<div class="h-text">${p.lines.map(l => `<p>${esc(l)}</p>`).join("")}</div>`); }
            { const [h, c] = sec("names", "Commemorations"); parts.push(h); if (!c) parts.push(this.namesHtml()); }
            { const [h, c] = sec("calendar", "Fasting calendar"); parts.push(h); if (!c) parts.push(this.calendarHtml()); }
            { const f = this.feasts(new Date(), this.cal()); const [h, c] = sec("feasts", "Feasts and fasts"); parts.push(h);
              if (!c) parts.push(`${f.current ? `<div class="h-row"><b>${esc(f.current.name)}</b> <span class="h-muted">day ${f.current.day}, ${f.current.left} to go</span></div>` : ""}<ul class="h-saints">${f.upcoming.map(e => `<li>${esc(e.name)} <span class="h-muted">${e.in === 0 ? "today" : e.in === 1 ? "tomorrow" : `in ${e.in} days`} · ${esc(e.date.toLocaleDateString(undefined, { day: "numeric", month: "short" }))}</span></li>`).join("")}</ul>`); }
            const nd = OrthodoxHome.nameDays(d.saints, this.friendsList());
            if (nd.length) { const [h, c] = sec("namedays", "Name days today"); parts.push(h);
                if (!c) parts.push(`<ul class="h-saints">${nd.map(n => `<li><b>${esc(n.name)}</b> <span class="h-muted">· ${this.saintLink(n.saint)}</span> — Many years!</li>`).join("")}</ul>`); }
            if (d.saints.length) { const [h, c] = sec("saints", "Saints commemorated", d.saints.length); parts.push(h); if (!c) parts.push(`<ul class="h-saints">${d.saints.map(s => `<li>${this.saintLink(s)}</li>`).join("")}</ul>`); }
            const [rh, rc] = sec("readings", "Readings");
            if (d.readings.length) {
                parts.push(rh);
                if (!rc) d.readings.forEach((r, i) => {
                    const open = this.openReadings.has(i);
                    parts.push(`<div class="h-reading" data-r="${i}"><span class="h-arrow">${open ? "▾" : "▸"}</span> <b>${esc(r.source)}</b> ${esc(r.display)}</div>`);
                    if (open) parts.push(`<div class="h-text">${r.text.map(v => `${v.p ? "<br>" : ""}<sup>${esc(v.v)}</sup> ${esc(v.t)}`).join(" ")}</div>`);
                });
            }
        }
        const list = (id, title, items) => {
            if (!items.length) return;
            const [h, c] = sec(id, title, items.length); parts.push(h);
            const when = n => !n.date ? "" : (Date.now() - n.date < 864e5 ? new Date(n.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : new Date(n.date).toLocaleDateString());
            if (!c) parts.push(`<ul class="h-news">${items.map(n => `<li><a href="${esc(n.link)}" target="_blank" rel="noreferrer noopener">${esc(n.title)}</a> <span class="h-muted">${[n.kind === "world" ? n.src : "", when(n)].filter(Boolean).map(esc).join(" · ")}</span></li>`).join("")}</ul>`);
        };
        if (this.news?.length) {
            if (this.settings.world) list("world", "World news", this.news.filter(n => n.kind === "world").slice(0, 10));
        }
        parts.push(`</section></div>`);
        parts.push(`<div class="h-foot">${this.cal() === "new" ? "New Calendar day and readings: orthocal.info (Revised Julian)" : "Old Calendar day and readings: orthocal.info (Julian)"} · Lives: OrthodoxWiki · World news: BBC, NPR</div>`);
        return parts.join("");
    }

    css() {
        const PAGE = `div[class*="content_"] > div[class*="page_"]`;
        return `
#cl3ar-home{display:none;position:fixed;z-index:40;overflow-y:auto;padding:28px 36px 40px;box-sizing:border-box;
 font:14px/1.5 var(--nx-font,inherit);color:var(--text-normal,#ddd);background:#0b0b0a}
body.cl3ar-home-on #cl3ar-home{display:block}
/* in a DM the list column is hidden, so the chat starts at the left edge of Discord's grid */
body.qi-focus ${PAGE}{grid-column:1 / -1!important}
/* split view: the chat stays in the gold box where the list was; Orthodox Today floats to its right */
body.cl3ar-home-on.qi-focus:not(.cl3ar-chat-full) ${PAGE}{justify-self:start!important;width:var(--cl3ar-chat-w,540px)!important;max-width:var(--cl3ar-chat-w,540px)!important;
 outline:2px solid #c9a24a;outline-offset:-2px}
body.cl3ar-chat-full #cl3ar-home{display:none!important}
body.qi-focus :is(section[class*="title_"],div[class*="bar_"] > div[class*="title_"]){padding-left:178px!important}
/* gold box: all top-bar buttons stay; the search bar only in full screen */
body.cl3ar-home-on.qi-focus:not(.cl3ar-chat-full) :is(section[class*="title_"],div[class*="bar_"] > div[class*="title_"]) [class*="search_"]{display:none!important}
/* no picture or empty picture circle next to the name in a DM's top bar */
body.qi-focus :is(section[class*="title_"],div[class*="bar_"] > div[class*="title_"]) [class*="avatar"]{display:none!important}
#cl3ar-full{position:fixed;z-index:1000;left:102px;top:calc(var(--custom-app-top-bar-height,24px) + 10px);width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;
 border:1px solid rgba(255,255,255,.18);background:#1e1e1e;color:#e8e8e8;font:600 13px var(--nx-font,inherit)}
#cl3ar-full:hover{background:#2c2c2c;color:#fff}
body:not(.qi-focus) #cl3ar-full{display:none}
#cl3ar-home .h-text p{margin:0 0 10px}
#cl3ar-home > *:not(.h-grid){max-width:760px}
#cl3ar-home .h-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:14px;margin-top:16px;align-items:start}
#cl3ar-home .h-card{background:rgba(255,255,255,.035);border:1px solid color-mix(in srgb,var(--lit,#d4b062) 26%,transparent);padding:4px 16px 12px;min-width:0;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease!important}
#cl3ar-home .h-card:hover{border-color:color-mix(in srgb,var(--lit,#d4b062) 55%,transparent);box-shadow:0 0 0 1px rgba(212,176,98,.12),0 6px 18px rgba(0,0,0,.35);background:rgba(255,255,255,.05)}
/* when Home opens the cards come in by pixel steps, one after another, then each icon is lit like a lamp; a redraw while they come in
   carries on where it was (--h-t0 = time since Home opened) instead of starting again */
${Array.from({ length: 15 }, (_, i) => `#cl3ar-home .h-grid > .h-card:nth-child(${i + 2}){--i:${i}}`).join(" ")}
/* the theme stills every animation in Discord (!important); Home's own small motions say !important again to come through */
#cl3ar-home.h-first .h-card{animation:cl3arIn .32s steps(4,end) calc(var(--i,0) * 55ms - var(--h-t0,0ms)) both!important}
#cl3ar-home.h-first .h-ico{animation:cl3arLit .3s steps(3,end) calc(var(--i,0) * 55ms + 260ms - var(--h-t0,0ms)) both!important}
@keyframes cl3arIn{0%{opacity:0;transform:translateY(8px);clip-path:inset(0 0 100% 0)}100%{opacity:1;transform:none;clip-path:inset(-24px)}}
@keyframes cl3arLit{0%{filter:brightness(.2) saturate(0)}100%{filter:none}}
/* the pixel icons: 16x16 drawn at 2x; on hover each does its small idle (frames of a sprite sheet) and glows softly */
#cl3ar-home .h-ico{display:inline-block;flex:none;width:32px;height:32px;vertical-align:middle;margin:0 8px 0 0;background:0 0 / auto 32px no-repeat;image-rendering:pixelated;transition:filter .25s ease!important}
${Object.entries(ICONS).map(([k, v]) => `#cl3ar-home .hi-${k}{background-image:${v.url};background-size:${32 * v.n}px 32px;--glow:${v.glow}}`).join(" ")}
${[...new Set(Object.values(ICONS).map(v => v.n))].map(n => `@keyframes cl3arS${n}{to{background-position:-${32 * n}px 0}}`).join(" ")}
${Object.entries(ICONS).map(([k, v]) => `#cl3ar-home :is(.h-card:hover,.h-verse:hover) .hi-${k}{animation:cl3arS${v.n} ${v.ms * v.n}ms steps(${v.n}) infinite!important}`).join(" ")}
#cl3ar-home :is(.h-card:hover,.h-verse:hover) .h-ico{filter:drop-shadow(0 0 4px color-mix(in srgb,var(--glow) 55%,transparent))}
${FOODS.map(([k, , url]) => `#cl3ar-home .h-food.hf-${k}{background-image:${url}}`).join(" ")}
#cl3ar-home .h-sec{transition:color .15s ease} #cl3ar-home .h-sec:hover{color:#f1d27a}
#cl3ar-home .h-reading{transition:color .12s ease} #cl3ar-home .h-reading:hover{color:#f1d27a}
#cl3ar-home .h-news a{transition:color .12s ease}
@media (prefers-reduced-motion:reduce){#cl3ar-home#cl3ar-home *,#cl3ar-home#cl3ar-home *::before,#cl3ar-home#cl3ar-home *::after{animation:none!important;transition:none!important}}
/* Discord in the background (a game in front): whatever still moves on Home holds still */
#cl3ar-home.h-still *,#cl3ar-home.h-still *::after{animation-play-state:paused!important}
#cl3ar-home .h-card.h-hidden{display:none}
#cl3ar-home .h-card h2{margin-top:10px}
#cl3ar-home .h-banner{position:relative;width:100%;aspect-ratio:108/17;max-height:190px;margin:-8px 0 18px;background:#0b0b0a center / cover no-repeat;
 image-rendering:pixelated;box-shadow:0 0 0 1px #000,0 0 0 2px color-mix(in srgb,var(--lit,#d4b062) 45%,transparent);overflow:hidden;cursor:pointer}
#cl3ar-home .h-banner-l{position:absolute;left:12px;bottom:8px;font:700 13px var(--nx-head,inherit);letter-spacing:.04em;color:#f1d27a;
 text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 4px #000;pointer-events:none}
#cl3ar-home .h-bird{position:absolute;width:15px;height:10px;pointer-events:none;image-rendering:pixelated;
 background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 2' shape-rendering='crispEdges'%3E%3Cpath fill='%23201814' d='M0 0h1v1H0zM2 0h1v1H2zM1 1h1v1H1zM4 0h1v1H4zM3 1h1v1H3zM5 1h1v1H5z'/%3E%3C/svg%3E") 0 0 / 200% 100% no-repeat;
 animation:cl3arFlap .3s steps(2) infinite,cl3arFly var(--d,3.2s) steps(40) forwards!important}
#cl3ar-home .h-ding{position:absolute;width:6px;height:6px;background:#fff2b0;box-shadow:0 0 6px #ffd36a;pointer-events:none;opacity:0;animation:cl3arDing 1.6s steps(8) forwards!important}
@keyframes cl3arDing{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(-60px)}}
@keyframes cl3arFlap{to{background-position:200% 0}}
@keyframes cl3arFly{0%{transform:translate(0,0)}100%{transform:translate(var(--x,-600px),var(--y,-160px))}}
@media (prefers-reduced-motion:reduce){#cl3ar-home .h-bird{display:none}}
#cl3ar-home button:focus-visible,#cl3ar-home input:focus-visible,#cl3ar-full:focus-visible,#cl3ar-note:focus-visible{outline:2px solid #f1d27a!important;outline-offset:1px}
#cl3ar-home .h-verse{font:italic 15px/1.55 Georgia,serif;margin:2px 0 8px;max-width:760px;color:#e8e0cc;display:flex;gap:10px;align-items:center}
#cl3ar-home .h-verse .h-ico{margin:0}
#cl3ar-home .h-greet{font:700 15px var(--nx-head,inherit);color:#e8604a;letter-spacing:.03em;margin:2px 0 -2px;text-shadow:0 0 8px rgba(232,96,74,.35)}
#cl3ar-home .h-pom{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px 18px;padding:6px 0 2px} #cl3ar-home .p-col{min-width:0}
#cl3ar-home .p-h{font:700 12px var(--nx-head,inherit);letter-spacing:.06em;text-transform:uppercase;color:#d4b062;margin-bottom:6px}
#cl3ar-home .p-list{list-style:none;margin:0;padding:0}
#cl3ar-home .p-list li{display:flex;align-items:center;gap:8px;height:24px;font-size:14px}
#cl3ar-home .p-candle{position:relative;flex:none;width:6px;height:18px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 9' shape-rendering='crispEdges'%3E%3Cpath fill='%23f4efe2' d='M1 4h1v5H1z'/%3E%3Cpath fill='%23c8b890' d='M0 8h3v1H0z'/%3E%3C/svg%3E") center bottom / 6px 18px no-repeat;image-rendering:pixelated}
#cl3ar-home .p-candle::after{content:"";position:absolute;left:2px;top:2px;width:2px;height:4px;background:#ffb43a;box-shadow:0 0 6px 2px rgba(255,180,58,.45);animation:cl3arFlame 1.3s steps(3) infinite!important}
#cl3ar-home .p-dep::after{background:#e8603a}
@keyframes cl3arFlame{0%{height:4px;top:2px;opacity:1}50%{height:5px;top:1px;opacity:.85}100%{height:4px;top:2px;opacity:1}}
#cl3ar-home .p-del{margin-left:auto;width:20px;height:20px;padding:0;cursor:pointer;color:var(--text-muted,#999);background:none;border:0;opacity:0;transition:opacity .12s}
#cl3ar-home .p-list li:hover .p-del{opacity:1} #cl3ar-home .p-del:hover{color:#e8604a}
#cl3ar-home .p-add{display:flex;gap:6px;margin-top:8px}
#cl3ar-home .p-add input{flex:1;min-width:0;height:26px;padding:0 8px;font:14px var(--nx-font,inherit);color:var(--text-normal,#ddd);background:rgba(0,0,0,.45);border:1px solid rgba(201,162,74,.3);outline:none}
#cl3ar-home .p-add input:focus{border-color:#d4b062}
#cl3ar-home .p-add button{height:26px;padding:0 12px;cursor:pointer;font:600 12px var(--nx-font,inherit);color:#f1d27a;background:rgba(201,162,74,.15);border:1px solid rgba(201,162,74,.4)}
#cl3ar-home .p-pr{margin-top:8px;font:italic 13px/1.5 Georgia,serif}
#cl3ar-home .h-cal{padding:6px 0 2px;max-width:340px}
#cl3ar-home .c-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-family:var(--nx-head,inherit)}
#cl3ar-home .c-head button{width:26px;height:22px;cursor:pointer;color:#f1d27a;background:rgba(0,0,0,.35);border:1px solid rgba(201,162,74,.3);transition:border-color .12s}
#cl3ar-home .c-head button:hover{border-color:#d4b062}
#cl3ar-home .c-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
#cl3ar-home .c-w{font-size:10px;text-align:center;opacity:.55}
#cl3ar-home .c-d{height:28px;display:flex;align-items:center;justify-content:center;font:600 12px var(--nx-font,inherit);box-shadow:inset 0 0 0 1px rgba(0,0,0,.5);transition:transform .1s ease}
#cl3ar-home .c-d:not(.c-pad):hover{transform:scale(1.12);position:relative;z-index:1}
#cl3ar-home .c-pad{box-shadow:none}
#cl3ar-home .c-free{background:rgba(255,255,255,.04)} #cl3ar-home .c-meat{background:#5e5430;color:#f6ecc8}
#cl3ar-home .c-fish{background:#2c4a6a;color:#d8e8f8} #cl3ar-home .c-oil{background:#4a5a2a;color:#e8f0c8} #cl3ar-home .c-strict{background:#5a1c1c;color:#f6d8d0}
#cl3ar-home .c-today{outline:2px solid #f1d27a;outline-offset:-2px}
#cl3ar-home .c-d:not(.c-pad){cursor:pointer} #cl3ar-home .c-sel{box-shadow:inset 0 0 0 2px #fff6d0,0 0 0 1px #000}
#cl3ar-home .c-info{margin:8px 0 2px;padding:8px 10px;background:rgba(0,0,0,.35);border:1px solid rgba(201,162,74,.3);font-size:13px}
#cl3ar-home .c-info .h-saints{margin-top:4px} #cl3ar-home .c-feast{font-weight:600;margin-top:2px}
#cl3ar-home .c-dot{display:inline-block;width:10px;height:10px;margin-right:6px;vertical-align:-1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.5)}
#cl3ar-home a.h-life{color:inherit;text-decoration:none;border-bottom:1px dotted color-mix(in srgb,var(--lit,#d4b062) 60%,transparent);transition:color .12s ease}
#cl3ar-home a.h-life:hover{color:#f1d27a;border-bottom-style:solid}
#cl3ar-home .h-count{opacity:.6;font-weight:400;letter-spacing:0}
#cl3ar-home .c-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:8px;font-size:11px;opacity:.85}
#cl3ar-home .c-legend i{display:inline-block;width:10px;height:10px;margin-right:5px;vertical-align:-1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.5)}
#cl3ar-home .c-note{font-size:11px;margin-top:6px}
#cl3ar-home .h-foods{display:inline-flex;gap:6px;margin-left:10px;vertical-align:-3px}
#cl3ar-home .h-food{display:inline-block;width:18px;height:18px;background:center / 18px 18px no-repeat;image-rendering:pixelated;position:relative;transition:transform .16s steps(2,end)!important}
#cl3ar-home .h-food:not(.no):hover{transform:translateY(-2px)}
#cl3ar-home .h-food.no{opacity:.35;filter:grayscale(.6)}
#cl3ar-home .h-food.no::after{content:"";position:absolute;left:-2px;right:-2px;top:8px;height:2px;background:#c8322a;transform:rotate(-40deg)}
#cl3ar-home .h-glory{animation:cl3arGlory 1.4s ease-out!important}
@keyframes cl3arGlory{0%{filter:drop-shadow(0 0 0 #ffd36a)}35%{filter:drop-shadow(0 0 14px #ffd36a) brightness(1.4)}100%{filter:none}}
#cl3ar-home .h-date{color:var(--gold,#c9a24a);font-weight:600;letter-spacing:.02em}
#cl3ar-home .h-title{font-size:22px;margin:4px 0 6px;color:var(--text-strong,#fff)}
#cl3ar-home h2:has(.h-ico){display:flex;align-items:center;min-height:32px}
#cl3ar-home h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--lit,#d4b062);margin:22px 0 6px;border-bottom:1px solid color-mix(in srgb,var(--lit,#d4b062) 40%,transparent);padding-bottom:3px}
#cl3ar-home .h-feast{font-weight:600;margin-bottom:6px}
#cl3ar-home .h-muted{opacity:.6;font-weight:400}
#cl3ar-home ul{margin:0;padding-left:18px}
#cl3ar-home .h-reading{cursor:pointer;padding:3px 0}
#cl3ar-home .h-reading:hover{color:var(--text-strong,#fff)}
#cl3ar-home .h-arrow{display:inline-block;width:12px;font-size:11px;opacity:.7}
#cl3ar-home .h-text{padding:6px 0 10px 16px;font-size:15px;line-height:1.65;font-family:Georgia,"Times New Roman",serif}
#cl3ar-home .h-text sup{opacity:.55;font-size:10px}
#cl3ar-note{flex:0 1 auto;min-width:0;margin-left:10px;padding:0 4px;height:24px;border:0;background:none!important;box-shadow:none!important;cursor:pointer;text-align:left;
 overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:700 12px var(--nx-font,inherit);color:#f1d27a!important;opacity:.95;
 text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 3px #000}
#cl3ar-note:hover{opacity:1}
#cl3ar-home .h-flash{animation:hFlash 1.6s ease-out 1!important}
@keyframes hFlash{0%,30%{box-shadow:0 0 0 2px #f1d27a,0 0 18px rgba(241,210,122,.55)}100%{box-shadow:0 0 0 0 transparent}}
#cl3ar-home .h-sec{cursor:pointer;user-select:none}
#cl3ar-home .h-sec:hover{color:var(--text-strong,#fff)}
#cl3ar-home .h-news a{color:var(--text-link,#9cc4ff)}
body.cl3ar-friends-open #cl3ar-home{display:none!important}
#cl3ar-home .h-actions{float:right;display:flex;flex-direction:column;gap:6px;margin-left:16px;min-width:120px;max-width:none}
#cl3ar-home .h-actions button{width:100%}
#cl3ar-home .h-actions button{height:30px;padding:0 16px;cursor:pointer;font:600 13px var(--nx-font,inherit);
 color:var(--text-normal,#ddd);background:var(--background-secondary,#222);border:1px solid var(--nx-black,#000);box-shadow:var(--nx-raised,none)}
#cl3ar-home .h-actions button:hover{background:var(--background-modifier-hover,#333)}
#cl3ar-home .h-friends{height:30px;padding:0 16px;cursor:pointer;font:600 13px var(--nx-font,inherit);
 color:var(--text-normal,#ddd);background:var(--background-secondary,#222);border:1px solid var(--nx-black,#000);box-shadow:var(--nx-raised,none)}
#cl3ar-home .h-friends:hover{background:var(--background-modifier-hover,#333)}
#cl3ar-home .h-foot{margin-top:28px;font-size:11px;opacity:.45}`;
    }
    /* where are we: home screen or a DM -> Orthodox Today shows; a server channel -> normal Discord */
    route() {
        const p = location.pathname;
        const on = p === "/channels/@me" || p.startsWith("/channels/@me/");
        document.body.classList.toggle("cl3ar-home-on", on);
        if (on && !this.wasOn) this.arm = true;                  // Home opens again: the cards come in again
        this.wasOn = on;
        if (!on) document.body.classList.remove("cl3ar-chat-full");
        // the gold chat box is as wide as the list it replaces
        const sb = document.querySelector('div[class*="content_"] > div[class*="sidebar_"]');
        const w = sb && sb.offsetParent ? Math.round(sb.getBoundingClientRect().width) : 0;
        if (w > 200) document.body.style.setProperty("--cl3ar-chat-w", w + "px");
        if (!document.getElementById("cl3ar-full")) {
            const b = document.createElement("button");
            b.id = "cl3ar-full"; b.type = "button";
            b.addEventListener("click", () => { document.body.classList.toggle("cl3ar-chat-full"); this.route(); });
            document.body.appendChild(b);
        }
        const full = document.body.classList.contains("cl3ar-chat-full"), fb = document.getElementById("cl3ar-full");
        const icon = full ? "M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" : "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6";
        if (fb.dataset.full !== String(full)) {
            fb.dataset.full = String(full);
            fb.title = full ? "Split view" : "Full screen";
            fb.setAttribute("aria-label", fb.title);
            fb.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></svg>`;
        }
    }
    diag() {
        try {
            const d = el => {
                if (!el) return null;
                const cs = getComputedStyle(el), r = el.getBoundingClientRect();
                const at = ["href", "role", "aria-label", "data-list-item-id"].map(a => el.getAttribute(a) ? ` ${a}="${String(el.getAttribute(a)).slice(0, 40)}"` : "").join("");
                return `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")}${el.id ? "#" + el.id : ""}${at} display=${cs.display} w=${Math.round(r.width)} h=${Math.round(r.height)} x=${Math.round(r.left)}`;
            };
            const up = (el, n) => { const o = []; while (el && n-- > 0) { o.push(d(el)); el = el.parentElement; } return o; };
            const dm = document.querySelector('nav[class*="privateChannels"]');
            const content = document.querySelector('div[class*="content_"]:has(> div[class*="sidebar_"])');
            const out = {
                at: new Date().toISOString(), path: location.pathname, body: document.body.className,
                dmUp: up(dm, 9), dmKids: dm ? [...dm.children].map(d) : null,
                friendsRowUp: up([...document.querySelectorAll('nav[class*="privateChannels"] *')].find(e => e.children.length === 0 && e.textContent.trim() === "Friends"), 8),
                dmHeader: (() => { const h = document.querySelector('section[class*="title_"] [class*="toolbar"], div[class*="bar_"] > div[class*="title_"] [class*="toolbar"]'); return h ? [d(h), ...[...h.children].map(c => "  " + d(c))] : null; })(),
                contentKids: content ? [...content.children].map(d) : null,
                sidebarKids: [...(document.querySelector('div[class*="content_"] > div[class*="sidebar_"]')?.children || [])].map(d),
            };
            const s = JSON.stringify(out);
            if (s !== this.lastDiag) { this.lastDiag = s; BdApi.Data.save(this.name, "diag", out); }
        } catch (e) { BdApi.Data.save(this.name, "diag", { error: String(e) }); }
    }
    mount() {
        this.route();
        clearTimeout(this.diagT); this.diagT = setTimeout(() => this.diag(), 800);
        let el = document.getElementById("cl3ar-home");
        if (!el) {
            el = document.createElement("div");
            el.id = "cl3ar-home";
            el.addEventListener("pointerup", e => {
                if (e.button !== 0 || e.target.closest("a")) return;
                if (e.target.closest(".h-pom") && this.namesClick(e)) return;
                const cal = e.target.closest("[data-cal]");
                if (cal) { this.calOffset = (this.calOffset || 0) + +cal.dataset.cal; this.calDay = 0; return this.redrawCal(); }
                const day = e.target.closest(".h-cal [data-day]");
                if (day) { this.calDay = this.calDay === +day.dataset.day ? 0 : +day.dataset.day; return this.redrawCal(); }
                const bn = e.target.closest(".h-banner");
                if (bn) { const r = bn.getBoundingClientRect(); return (e.clientX - r.left) / r.width > 0.86 ? this.ring(bn) : this.flock(bn); }
                if (e.target.closest(".h-friends")) return dispatchEvent(new CustomEvent("cl3ar:open-friends"));
                if (e.target.closest(".h-status")) return dispatchEvent(new CustomEvent("cl3ar:open-status"));
                const h = e.target.closest(".h-sec");
                if (h) { const s = h.dataset.s; this.collapsed.has(s) ? this.collapsed.delete(s) : this.collapsed.add(s); BdApi.Data.save(this.name, "collapsed", [...this.collapsed]); return this.render(); }
                const r = e.target.closest(".h-reading");
                if (!r) return;
                const set = r.dataset.l !== undefined ? (this.openLives ||= new Set()) : this.openReadings;
                const i = +(r.dataset.l ?? r.dataset.r);
                set.has(i) ? set.delete(i) : set.add(i);
                this.render();
            });
            // every outside link (news, readings, lives of the saints) opens in the user's browser, never inside Discord
            el.addEventListener("click", e => {
                const a = e.target.closest?.("a[href]");
                if (!a || !el.contains(a)) return;
                e.preventDefault(); e.stopPropagation();
                OrthodoxHome.openOut(a.getAttribute("href"));
            });
            el.addEventListener("keydown", e => {
                const day = e.target.closest?.(".h-cal [data-day]");
                if (day && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); this.calDay = this.calDay === +day.dataset.day ? 0 : +day.dataset.day; this.redrawCal(); document.querySelector(`#cl3ar-home .h-cal [data-day="${day.dataset.day}"]`)?.focus(); return; }
                const inp = e.target.closest?.(".h-pom input");
                if (!inp) return;
                e.stopPropagation();                                   // typing a name never reaches Discord's shortcuts
                if (e.key === "Enter") { e.preventDefault(); if (this.addName(inp.dataset.list, inp.value)) this.redrawNames(inp.dataset.list); }
            });
            document.body.appendChild(el); // a layer of its own; Discord's layout is never touched
            this.render(el);
        }
        if (this.arm) this.enter(el);
        this.place(el);
        return el;
    }
    /* the cards come in when Home opens, not on every redraw */
    enter(el) {
        this.arm = false; this.enterAt = Date.now();
        el.style.setProperty("--h-t0", "0ms"); el.classList.remove("h-first"); void el.offsetWidth; el.classList.add("h-first");
        clearTimeout(this.enterT); this.enterT = setTimeout(() => el.classList.remove("h-first"), 1600);
    }
    /* cover the page area (home screen) or the space right of the gold chat box (DM split view) */
    place(el = document.getElementById("cl3ar-home")) {
        const page = document.querySelector('div[class*="content_"] > div[class*="page_"]');
        if (!el || !page || !document.body.classList.contains("cl3ar-home-on")) return;
        const r = page.getBoundingClientRect(), c = page.parentElement.getBoundingClientRect();
        const split = document.body.classList.contains("qi-focus");
        const left = Math.round(split ? r.right : r.left), top = Math.round(r.top);
        const box = `${left},${top},${Math.round(c.right - left)},${Math.round(r.height)}`;
        if (box === this.lastBox && el.style.width) return;
        this.lastBox = box;
        Object.assign(el.style, { left: left + "px", top: top + "px", width: Math.max(0, c.right - left) + "px", height: r.height + "px" });
    }
    /* click the church: the bell rings (you hear it only if the bell is turned on) */
    ring(bn) {
        dispatchEvent(new CustomEvent("cl3ar:ring"));
        if (bn.querySelectorAll(".h-ding").length > 8) return;
        const r = bn.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            const d = document.createElement("i");
            d.className = "h-ding";
            d.style.left = (0.926 * r.width + (i % 2 ? 1 : -1) * (10 + i * 4)) + "px"; d.style.top = (0.38 * r.height) + "px";
            d.style.setProperty("animation-delay", (i * 0.18).toFixed(2) + "s", "important");
            bn.appendChild(d); setTimeout(() => d.remove(), 2400);
        }
    }
    flock(bn) {
        if (bn.querySelectorAll(".h-bird").length > 12) return;
        const r = bn.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
            const b = document.createElement("i");
            b.className = "h-bird";
            b.style.left = (0.9 * r.width + (Math.random() - .5) * 30) + "px"; b.style.top = (0.42 * r.height + Math.random() * 12) + "px";
            b.style.setProperty("--x", -(0.35 + Math.random() * 0.6) * r.width + "px"); b.style.setProperty("--y", -(0.4 + Math.random() * 0.7) * r.height + "px");
            b.style.setProperty("--d", (2.4 + Math.random() * 1.8).toFixed(2) + "s"); b.style.setProperty("animation-delay", `0s,${(i * 0.12).toFixed(2)}s`, "important");
            bn.appendChild(b); setTimeout(() => b.remove(), 4600);
        }
    }
    paintColour(el = document.getElementById("cl3ar-home")) {
        const c = OrthodoxHome.litColour(globalThis.__cl3arScene?.key);
        if (el && el.style.getPropertyValue("--lit") !== c) el.style.setProperty("--lit", c);
    }
    renderBanner() {
        const el = document.getElementById("cl3ar-home"), old = el?.querySelector(".h-banner");
        if (this.stopped || !el) return;
        this.paintColour(el);
        const sc = globalThis.__cl3arScene, key = sc ? sc.url + sc.label + (sc.weather || "") : "";
        if (key === this.bannerKey && old) return;
        this.bannerKey = key;
        if (!old || !sc) return this.render();
        const tmp = document.createElement("div"); tmp.innerHTML = this.bannerHtml(); old.replaceWith(tmp.firstElementChild);
    }
    bannerHtml() {
        const sc = globalThis.__cl3arScene;
        return sc ? `<div class="h-banner" title="Click the sky to send the birds up, or the church to ring the bell" style="background-image:${esc(sc.url)}"><span class="h-banner-l">${esc(sc.label)}${sc.weather === "rain" ? " · rain" : ""} · ${esc(OrthodoxHome.hourOf(new Date().getHours()))}</span></div>` : "";
    }
    render(el = document.getElementById("cl3ar-home")) {
        if (this.stopped) return;
        if (el) { this.paintColour(el); if (el.classList.contains("h-first")) el.style.setProperty("--h-t0", (Date.now() - this.enterAt) + "ms"); el.innerHTML = this.html(); }
        this.renderNote();
    }

    /* a quiet line beside mute / deafen / settings: today's Old Calendar date and saint, or the Jesus Prayer */
    noteText() {
        if (this.settings.panelNote === "prayer") return "Lord Jesus Christ, Son of God, have mercy on me, a sinner.";
        const now = new Date(), g = OrthodoxHome.greeting(now, this.cal()).split("!")[0];
        return (g ? g + "! · " : "") + now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) + " · " + now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    /* the date in the bottom panel leads to the calendar: Home opens, the calendar card unfolds, comes into view and glows once (tested) */
    openCalendar() {
        const R = BdApi.Webpack.getByKeys?.("transitionTo", "replaceWith");
        if (!location.pathname.startsWith("/channels/@me")) try { R?.transitionTo ? R.transitionTo("/channels/@me") : (history.pushState({}, "", "/channels/@me"), dispatchEvent(new PopStateEvent("popstate"))); } catch (_) {}
        clearInterval(this.calSeek);
        let tries = 0, unfolded = false;
        this.calSeek = setInterval(() => {
            const home = document.getElementById("cl3ar-home");
            const head = home?.querySelector('.h-sec[data-s="calendar"]');
            if (head && !home.querySelector(".h-cal") && !unfolded) { unfolded = true; head.click(); } // unfold it if it was folded
            const cal = home?.querySelector(".h-cal")?.closest(".h-card") || home?.querySelector(".h-cal");
            if (cal || ++tries > 40 || this.stopped) {
                clearInterval(this.calSeek); this.calSeek = null;
                if (!cal) return;
                cal.scrollIntoView({ block: "center", behavior: "smooth" });
                cal.classList.remove("h-flash"); void cal.offsetWidth; cal.classList.add("h-flash");
            }
        }, 50);
    }
    renderNote() {
        const wrap = document.querySelector('section[class*="panels_"] [class*="buttons_"]')?.parentElement;
        let el = document.getElementById("cl3ar-note");
        if (this.settings.panelNote === "off" || !wrap) { el?.remove(); return; }
        if (!el || el.parentElement !== wrap) {
            el?.remove();
            el = document.createElement("button"); // a button, so the minimal-panel rule keeps it
            el.id = "cl3ar-note"; el.type = "button";
            el.addEventListener("click", () => this.openCalendar());
            wrap.appendChild(el);
        }
        const txt = this.noteText();
        const tip = [txt, this.day?.old && this.cal() === "old" ? `${this.day.old} (Old Calendar)` : "", this.day?.saints?.[0] || "", OrthodoxHome.hourOf(new Date().getHours())].filter(Boolean).join(String.fromCharCode(10));
        if (el.textContent !== txt || el.title !== tip) { el.textContent = txt; el.title = tip; }
    }

    start() {
        this.stopped = false;
        this.load();
        this.months = new Map([...(this.months || [])].filter(([, v]) => v)); // a month that failed to load is asked again
        if (!this.settings.home) return;
        BdApi.DOM.addStyle(this.name, this.css());
        let q = false;
        const away = () => document.hidden || (typeof document.hasFocus === "function" && !document.hasFocus());
        this.obs = new MutationObserver(() => { if (q || this.stopped) return; q = true; setTimeout(() => { q = false; if (this.stopped) return; try { this.mount(); this.renderNote(); } catch (_) {} }, 250); });
        this.obs.observe(document.body, { childList: true, subtree: true });
        this.onNav = () => { try { this.mount(); } catch (_) {} };
        addEventListener("popstate", this.onNav);
        this.onScene = () => { try { this.renderBanner(); } catch (_) {} };
        addEventListener("cl3ar:scene", this.onScene);
        addEventListener("resize", this.onNav);
        this.placeTimer = setInterval(() => { const a = away(); document.getElementById("cl3ar-home")?.classList.toggle("h-still", a); if (a) return; try { this.place(); } catch (_) {} }, 1000); // follows Discord resizing its own columns
        this.SelectedChannelStore = BdApi.Webpack.getStore("SelectedChannelStore");
        this.SelectedChannelStore?.addChangeListener?.(this.onNav);
        this.mount();
        this.refreshData();
        this.timer = setInterval(() => this.refreshData(), 30 * 60 * 1000);
        // what really receives a click on the home page (written to home.clicks); only when debugging is turned on
        this.onProbe = e => {
            if (!this.settings.debugClicks) return;
            const h = document.getElementById("cl3ar-home");
            const side = e.target.closest?.('nav[class*="guilds"],#quietinbox-bar,#qi-fav');
            const shown = el => !!el && getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;
            const r = shown(h) ? h.getBoundingClientRect() : null;
            const inRect = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            if (!side && !inRect) return;
            const name = el => el ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${[...el.classList].slice(0, 2).join(".")}${el.getAttribute("data-list-item-id") ? "[" + el.getAttribute("data-list-item-id") + "]" : ""}${el.getAttribute("aria-label") ? '"' + el.getAttribute("aria-label").slice(0, 30) + '"' : ""}` : null;
            const chain = []; for (let el = e.target, n = 0; el && n < 6; el = el.parentElement, n++) chain.push(name(el));
            const top = document.elementFromPoint(e.clientX, e.clientY);
            const log = (BdApi.Data.load(this.name, "clicks") || []).slice(-4);
            const rec = { at: new Date().toISOString(), x: e.clientX, y: e.clientY, pathBefore: location.pathname, inHome: !!h?.contains(e.target), chain, top: name(top), z: h ? getComputedStyle(h).zIndex : null };
            log.push(rec);
            BdApi.Data.save(this.name, "clicks", log);
            setTimeout(() => { rec.pathAfter = location.pathname; rec.homeShown = shown(h); BdApi.Data.save(this.name, "clicks", log); }, 900);
        };
        addEventListener("pointerdown", this.onProbe, true);
        this.clock = setInterval(() => { try { this.renderNote(); if (this.dayKey && this.dayKey !== this.today().key) { this.dayKey = this.today().key; this.refreshData(); } } catch (_) {} }, 15000); // the time beside mute / deafen / settings // calendar is cached per day; news refreshes every 30 min
    }
    stop() {
        this.stopped = true; this.lastBox = null; this.wasOn = false; clearTimeout(this.diagT); clearTimeout(this.enterT);
        this.obs?.disconnect();
        clearInterval(this.timer);
        clearInterval(this.clock);
        removeEventListener("pointerdown", this.onProbe, true);
        removeEventListener("popstate", this.onNav);
        removeEventListener("cl3ar:scene", this.onScene);
        removeEventListener("resize", this.onNav);
        clearInterval(this.placeTimer);
        this.SelectedChannelStore?.removeChangeListener?.(this.onNav);
        document.getElementById("cl3ar-home")?.remove();
        document.getElementById("cl3ar-full")?.remove();
        document.getElementById("cl3ar-note")?.remove(); clearInterval(this.calSeek); this.calSeek = null;
        document.body.classList.remove("cl3ar-home-on", "cl3ar-chat-full");
        BdApi.DOM.removeStyle(this.name);
    }
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "switch", id: "home", name: "Orthodox Today on the home screen", note: "The church day, saints (with their lives), fast and readings.", value: this.settings.home },
                { type: "dropdown", id: "calendar", name: "Church calendar", note: "Fixed feasts and saints by the Old (Julian) or the New (Revised Julian) calendar. Pascha is the Orthodox Pascha in both.", value: this.cal(),
                  options: [{ label: "Old (Julian)", value: "old" }, { label: "New (Revised Julian)", value: "new" }] },
                { type: "switch", id: "world", name: "World news (BBC, NPR)", value: this.settings.world },
                { type: "dropdown", id: "panelNote", name: "Beside mute / deafen / settings", value: this.settings.panelNote,
                  options: [{ label: "Date and time", value: "today" }, { label: "The Jesus Prayer", value: "prayer" }, { label: "Nothing", value: "off" }] },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.stop(); this.start();
                dispatchEvent(new CustomEvent("cl3ar:settings"));                                      // the scene (St Sergius) redraws at once
                if (id === "calendar") dispatchEvent(new CustomEvent("cl3ar:calendar", { detail: value })); },
        });
    }
};
