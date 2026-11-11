/**
 * @name SeasonArt
 * @author cl3ar-ai
 * @version 2.0.0
 * @description A small living pixel-art scene behind the bottom bar. Home gets its own wider picture of the monastery for the same moment. It follows the Church calendar, Old or New as chosen on Home (Great Feasts with their afterfeasts, the four fasts, Holy Week, Pascha, Christmastide), the time of year and the time of day, with birds, snow, petals, leaves, clouds, stars and candlelight. Drawn by the plugin itself, nothing downloaded.
 */

const W = 108, H = 17; // 4 screen pixels per art pixel fills a 432 x 68 bar
const BW = 216, BH = 34; // the Home banner: the same 108:17 shape, twice as fine (about 950 x 150 on screen)

/* ---------- colour helpers ---------- */
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { if (!a) return a; const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

/* ---------- palettes ---------- */
const BASE = {
    winter:   { sky: ["#1b2440", "#2c3a5e", "#4a5a80"], sun: "#e8eef8", hill: "#c9d4e2", ground: "#e9eff7", top: "#ffffff", church: "#3a3a46", roof: "#272731", dome: "#c9a24a", door: "#16161b", win: "#f3d27a", tree: "#1f4a3a", trunk: "#3b2a1e", trees: "fir", part: "#ffffff", parts: 34, fall: "snow", birds: 1 },
    spring:   { sky: ["#6fa8db", "#9fc7e8", "#cfe5f1"], sun: "#fff3b0", hill: "#6fa65a", ground: "#4f8a3e", top: "#7cc061", church: "#ebe5d6", roof: "#8a3b32", dome: "#3c6fb4", door: "#5a3a2a", win: "#3a4a6a", tree: "#eaa7c1", trunk: "#6b4a32", trees: "round", part: "#f8cadb", parts: 12, fall: "petal", birds: 3, clouds: 2 },
    summer:   { sky: ["#3a89d4", "#6aaee6", "#bde0f4"], sun: "#ffd84a", hill: "#86a845", ground: "#c49d36", top: "#e1c35a", church: "#f0e9d9", roof: "#6e2f28", dome: "#d9b24e", door: "#4a2f20", win: "#2f3c55", tree: "#3f7a34", trunk: "#5a3d28", trees: "round", part: "#fff3a6", parts: 8, fall: "sparkle", birds: 3, clouds: 2 },
    autumn:   { sky: ["#35273f", "#8a4a3a", "#e39a52"], sun: "#ffd17a", hill: "#6a4a2a", ground: "#4a3320", top: "#7c5329", church: "#d9ccb1", roof: "#5a2620", dome: "#c9a24a", door: "#2a1a12", win: "#f3d27a", tree: "#c8642a", tree2: "#e3a32f", trunk: "#3e2a1a", trees: "round", part: "#d8682a", part2: "#e8b03a", parts: 14, fall: "leaf", birds: 2, clouds: 1 },
};
const PAL = {
    ...BASE,
    nativity: { ...BASE.winter, sky: ["#0a0f24", "#131a38", "#202d55"], sun: null, hill: "#bcc8da", ground: "#e2e9f3", church: "#30303c", roof: "#22222b", dome: "#d9b24e", door: "#14141a", win: "#ffd36a", tree: "#1d4636", parts: 22, star: "#fff6c8", fixedSky: true, birds: 0, stars: 14 },
    lent:     { ...BASE.winter, sky: ["#251c34", "#43305a", "#6e537a"], sun: "#d8cfe8", hill: "#3a2f45", ground: "#2a2233", top: "#4a3a56", church: "#5a5068", roof: "#3e3650", dome: "#8a7aa0", door: "#1e1828", win: "#c9b8e0", tree: "#2c3838", trunk: "#2a2028", trees: "fir", part: null, parts: 0, birds: 1, birdC: "#120e18", lamp: true },
    pascha:   { ...BASE.spring, sky: ["#5a1f30", "#b4483a", "#ec9a50"], sun: "#ffffff", hill: "#7cb85a", ground: "#5a9a44", top: "#8fd06a", church: "#f6f0e3", roof: "#b0302a", dome: "#d9b24e", door: "#6a3a28", win: "#f3d27a", tree: "#ffffff", trunk: "#6b4a32", trees: "round", part: null, parts: 0, eggs: "#d8342c", fixedSky: true, birds: 3, birdC: "#2a1416", clouds: 0 },
    // Great Feasts
    theophany:      { ...BASE.winter, sky: ["#244a86", "#4a7cc0", "#a6cbea"], sun: null, river: true, treesAt: [8, 22, 96], parts: 0, birds: 0, motif: "dove" },
    meeting:        { ...BASE.winter, motif: "candles", parts: 16 },
    annunciation:   { ...BASE.spring, sun: null, motif: "lily" },
    palm:           { ...BASE.spring, trees: "palm", tree: "#3f8a3a", motif: "fronds", parts: 0 },
    holyweek:       { ...BASE.winter, sky: ["#0d0912", "#1c1224", "#3a1c2c"], sun: null, hill: "#241a28", ground: "#18121c", top: "#2c2030", church: "#3a3040", roof: "#241c2c", dome: "#6a5a40", door: "#0c0a10", win: "#b8402c", tree: "#141c1c", trunk: "#1a1418", part: null, parts: 0, fixedSky: true, birds: 0, motif: "golgotha" },
    ascension:      { ...BASE.summer, sun: null, motif: "ascension", clouds: 1 },
    pentecost:      { ...BASE.summer, sky: ["#4f94cc", "#86bfe4", "#cbe8f2"], sun: null, hill: "#58a844", ground: "#3e8a34", top: "#7cd060", tree: "#4a9a3c", trees: "birch", parts: 0, motif: "flames" },
    transfiguration:{ ...BASE.summer, sun: null, motif: "tabor", tree2: "#3f7a34" },
    dormition:      { ...BASE.summer, sky: ["#0e1838", "#203266", "#3c5896"], sun: null, hill: "#3a5a3a", ground: "#2e4a2a", top: "#4a6a40", win: "#ffd36a", parts: 0, fixedSky: true, birds: 0, stars: 16, motif: "dormition" },
    nativityTheotokos: { ...BASE.summer, sky: ["#3e6aa8", "#87a9d6", "#e8d9a8"], motif: "cornflowers" },
    exaltation:     { ...BASE.autumn, sky: ["#3a1020", "#8a2a2a", "#e0a050"], sun: null, motif: "cross" },
    entry:          { ...BASE.winter, sky: ["#121a36", "#1e2a50", "#34406a"], sun: null, win: "#ffd36a", parts: 10, fixedSky: true, birds: 0, stars: 10, motif: "steps" },
    protection:     { ...BASE.autumn, sun: null, motif: "veil" },
    peterpaul:      { ...BASE.summer, river: true, treesAt: [8, 22, 96], motif: "boat" },
    // fasts: quieter colours and a lampada
    nativityfast:   { ...BASE.winter, sky: ["#151a2e", "#232b46", "#38405e"], sun: "#c8cede", hill: "#9aa6ba", ground: "#c4ccda", top: "#dfe6f0", lamp: true, birds: 0 },
    apostlesfast:   { ...BASE.summer, sky: ["#34507a", "#5a7aa0", "#a8b8c8"], sun: "#f0e0a0", hill: "#6a8a4a", ground: "#9a8240", top: "#b8a058", lamp: true, birds: 2 },
    dormitionfast:  { ...BASE.summer, sky: ["#1c2a58", "#36508a", "#7088b8"], sun: "#e8e0c0", lamp: true, motif: "lilies", birds: 1 },
};
const LABEL = { winter: "Winter", spring: "Spring", summer: "Summer", autumn: "Autumn", nativity: "Nativity and Christmastide", theophany: "Theophany", meeting: "Meeting of the Lord",
    annunciation: "Annunciation", lent: "Great Lent", palm: "Palm Sunday", holyweek: "Holy Week", pascha: "Pascha", ascension: "Ascension", pentecost: "Pentecost",
    peterpaul: "Ss Peter and Paul", transfiguration: "Transfiguration", dormition: "Dormition", nativityTheotokos: "Nativity of the Theotokos", exaltation: "Exaltation of the Cross",
    protection: "Protection of the Theotokos", entry: "Entry of the Theotokos", nativityfast: "Nativity Fast", apostlesfast: "Apostles' Fast", dormitionfast: "Dormition Fast" };
const PHASES = ["dawn", "day", "dusk", "night"];

module.exports = class SeasonArt {
    constructor(meta) { this.name = meta?.name || "SeasonArt"; }
    load() { this.settings = Object.assign({ on: true, season: "auto", animate: true, daylight: true, weather: true, pauseAway: true }, BdApi.Data.load(this.name, "settings") || {}); }
    save() { BdApi.Data.save(this.name, "settings", this.settings); }

    static julianPascha(y) { // Meeus' Julian computus -> civil date
        const a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
        const m = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1;
        return new Date(y, m - 1, day + 13);
    }
    /* Old or New Calendar, as chosen on Home ("old" by default). Pascha and its cycle are Orthodox (Julian computus) in both. */
    static calStyle() { try { return globalThis.BdApi?.Data?.load?.("Cl3ar_orthodox_discord", "home.settings")?.calendar === "new" ? "new" : "old"; } catch (_) { return "old"; } }
    /* the dates used by the scene: fixed feasts and fasts Julian (+13 days) on the Old Calendar, civil on the New (tested against OrthodoxHome.feasts) */
    static calendar(y, cal = SeasonArt.calStyle()) {
        const off = cal === "new" ? 0 : 13, J = (yy, m, d) => new Date(yy, m - 1, d + off), P = SeasonArt.julianPascha(y);
        const add = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
        const feasts = []; // [key, first day, days incl. afterfeast]
        for (const yy of [y - 1, y]) for (const [k, m, d, n] of [["theophany", 1, 6, 9], ["meeting", 2, 2, 8], ["annunciation", 3, 25, 2], ["peterpaul", 6, 29, 1],
            ["transfiguration", 8, 6, 8], ["dormition", 8, 15, 9], ["nativityTheotokos", 9, 8, 5], ["exaltation", 9, 14, 8], ["protection", 10, 1, 1],
            ["entry", 11, 21, 5], ["nativity", 12, 25, 12]]) feasts.push([k, J(yy, m, d), n]);
        feasts.push(["palm", add(P, -7), 1], ["ascension", add(P, 39), 9], ["pentecost", add(P, 49), 7]);
        const fasts = [["apostlesfast", add(P, 57), J(y, 6, 28)], ["dormitionfast", J(y, 8, 1), J(y, 8, 14)],
            ["nativityfast", J(y, 11, 15), J(y, 12, 24)], ["nativityfast", J(y - 1, 11, 15), J(y - 1, 12, 24)]];
        return { P, feasts, fasts, add };
    }
    /* which scene: Pascha > a feast day > Holy Week > Lent > afterfeast > fast > time of year (tested) */
    static seasonOf(now = new Date(), cal = SeasonArt.calStyle()) {
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const { P, feasts, fasts, add } = SeasonArt.calendar(d0.getFullYear(), cal);
        const dp = Math.round((d0 - P) / 864e5), same = (a, b) => a.getTime() === b.getTime();
        if (dp >= 0 && dp < 39) return "pascha";                      // Pascha to the leave-taking
        const day = feasts.find(([, f]) => same(f, d0));
        if (day) return day[0];                                        // the feast itself wins, even in Lent
        if (dp >= -6 && dp < 0) return "holyweek";
        if (dp >= -48 && dp < -7) return "lent";                      // Clean Monday to Lazarus Saturday
        const after = feasts.find(([, f, n]) => d0 >= f && d0 < add(f, n));
        if (after) return after[0];
        const fast = fasts.find(([, a, b]) => a < b && d0 >= a && d0 <= b);
        if (fast) return fast[0];
        const m = d0.getMonth();
        return m === 11 || m < 2 ? "winter" : m < 5 ? "spring" : m < 8 ? "summer" : "autumn";
    }
    /* the weather of the day: the same all day, different day to day; never on a Great Feast (tested) */
    static weatherOf(now = new Date(), key = SeasonArt.seasonOf(now)) {
        const chance = { spring: 30, summer: 15, autumn: 35, apostlesfast: 15, dormitionfast: 15 }[key];
        if (!chance) return null;
        let h = now.getFullYear() * 400 + now.getMonth() * 32 + now.getDate();
        h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h = (h ^ (h >>> 16)) >>> 0;
        return h % 100 < chance ? "rain" : null;
    }
    /* the bells ring on Sundays and feast days, in the morning and the day (tested) */
    static bellsOf(now = new Date(), key = SeasonArt.seasonOf(now), phase = SeasonArt.phaseOf(now)) {
        if (phase !== "dawn" && phase !== "day") return false;
        if (["holyweek", "lent"].includes(key) && now.getDay() !== 0) return false;
        return now.getDay() === 0 || !["winter", "spring", "summer", "autumn", "lent", "nativityfast", "apostlesfast", "dormitionfast", "holyweek"].includes(key);
    }
    static phaseOf(now = new Date()) {
        const h = now.getHours();
        return h >= 21 || h < 5 ? "night" : h < 8 ? "dawn" : h < 18 ? "day" : "dusk";
    }
    /* the palette at a time of day */
    static shade(P, phase) {
        if (phase === "day" || P.fixedSky || !phase) return { ...P };
        const Q = { ...P }, keys = ["hill", "ground", "top", "church", "roof", "dome", "door", "tree", "tree2", "trunk"];
        if (phase === "night") {
            Q.sky = P.sky.map((c, i) => mix(c, ["#060a1a", "#0e1736", "#22305c"][i], .82));
            for (const k of keys) Q[k] = mix(P[k], "#04060e", .55);
            Q.moon = "#d8d2b8"; Q.sun = null; Q.win = "#ffd36a"; Q.stars = Math.max(P.stars || 0, 18);
            Q.birds = 0; Q.clouds = 0; Q.part = P.fall === "snow" ? "#c8d2e4" : null; Q.parts = P.fall === "snow" ? P.parts : 0;
            Q.fireflies = P.fall === "sparkle" ? 7 : 0;
        } else {
            const warm = phase === "dawn" ? ["#3a2a4a", "#c06a58", "#f4b070"] : ["#2a1f45", "#a8504a", "#f09a50"];
            Q.sky = P.sky.map((c, i) => mix(c, warm[i], phase === "dawn" ? .6 : .68));
            for (const k of keys) Q[k] = mix(P[k], "#120a10", phase === "dawn" ? .18 : .28);
            if (P.sun) Q.sun = phase === "dawn" ? "#ffd9a0" : "#ffb070";
            Q.low = true; if (phase === "dusk") Q.win = "#ffd36a";
            if (P.fall === "sparkle") Q.parts = 0;
        }
        return Q;
    }

    /* the pixel scene as an SVG string: a still picture plus small animated layers (tested) */
    static scene(key, opt = {}) {
        const phase = opt.phase || "day", animate = opt.animate !== false;
        const P = SeasonArt.shade(PAL[key] || PAL.autumn, phase), g = new Array(W * H).fill(null), anim = [];
        if (opt.weather === "rain") { P.sky = P.sky.map(c => mix(c, "#5a606a", .45)); P.sun = null; P.birds = 0; P.parts = 0; P.clouds = Math.max(P.clouds || 0, 3); P.rain = true; P.fireflies = 0; }
        const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = c; };
        let s = 7 + key.length * 131 + PHASES.indexOf(phase) * 17; const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        const gy = x => 14 + Math.round(Math.sin(x / 13 + 2));        // the near ground line
        const seed0 = key.length * 977, nz = (x, y) => (((x * 73856093) ^ (y * 19349663) ^ seed0) >>> 0) % 100; // fixed per-pixel noise
        const dk = (c, t) => mix(c, "#000000", t), lt = (c, t) => mix(c, "#ffffff", t);
        const rect = (x, y, c) => `<rect x='${Math.round(x)}' y='${Math.round(y)}' width='1' height='1' fill='${c}'/>`;
        const blink = (inner, dur, vals, begin = 0) => `<g opacity='${vals.split(";")[0]}'>${inner}<animate attributeName='opacity' values='${vals}' dur='${dur}s' begin='${(-begin).toFixed(2)}s' calcMode='discrete' repeatCount='indefinite'/></g>`;
        const move = (inner, pts, dur, begin = 0) => `<g>${inner}<animateTransform attributeName='transform' type='translate' values='${pts.map(p => p.join(" ")).join(";")}' dur='${dur}s' begin='${(-begin).toFixed(2)}s' calcMode='discrete' repeatCount='indefinite'/></g>`;

        // sky in three bands, dithered where they meet
        const [s0, s1, s2] = P.sky, band = [s0, s0, mix(s0, s1, .34), mix(s0, s1, .34), mix(s0, s1, .67), mix(s0, s1, .67), s1, s1, mix(s1, s2, .45), mix(s1, s2, .45)];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            let c = band[y] || s2;
            if (phase === "night" && !P.fixedSky) { const d = Math.hypot((x - 100) / 1.6, y - 9); if (d < 8) c = mix(c, "#3a3458", .28 * (1 - d / 8)); }
            put(x, y, c);
        }
        // soft clouds resting on the horizon (not at night, not in rain)
        if (phase !== "night" && !P.rain && !P.fixedSky) {
            const cc = mix(s1, "#ffffff", phase === "day" ? .4 : .24), rim = mix(s1, "#ffffff", phase === "day" ? .62 : .38);
            for (const [x0, y0, rows] of [[10, 6, ["...######...", ".##########.", "############"]], [44, 7, ["....#######.....", "..############..", "################"]]])
                rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") put(x0 + x, y0 + y, y === 0 || (y === 1 && r[x - 1] !== "#") ? rim : cc); }));
        }
        // stars (some twinkle)
        for (let i = 0; i < (P.stars || 0); i++) {
            const x = Math.floor(rnd() * W), y = Math.floor(rnd() * 9);
            if (animate && i % 3 === 0) anim.push(blink(rect(x, y, "#dfe6ff"), +(2 + (i % 5) * .7).toFixed(1), "1;0.15;1;1", rnd() * 4)); else put(x, y, i % 4 ? "#b8c4ee" : "#ffffff");
        }
        if (P.star) { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 2], [0, 3]]) put(30 + dx, 3 + dy, P.star);
            if (animate) anim.push(blink([[2, 0], [-2, 0], [0, 4], [0, -2]].map(([dx, dy]) => rect(30 + dx, 3 + dy, P.star)).join(""), 1.6, "1;0")); else for (const [dx, dy] of [[2, 0], [-2, 0]]) put(30 + dx, 3 + dy, P.star); }
        if (P.sun) {
            const cy = key === "pascha" || P.low ? 9 : 4, rows = key === "pascha" ? ["..###..", ".#####.", "#######", "#######", "#######", ".#####.", "..###.."] : [".###.", "#####", "#####", "#####", ".###."];
            const n = rows.length, x0 = 81 - (n >> 1), y0 = cy - (n >> 1);
            for (let y = y0 - 2; y < y0 + n + 2; y++) for (let x = x0 - 2; x < x0 + n + 2; x++) { const d = Math.hypot(x - 81, y - cy); if (d > n / 2 && d < n / 2 + 1.6) put(x, y, mix(band[y] || s2, P.sun, .22)); }
            rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") put(x0 + x, y0 + y, y === 0 || x === 0 ? lt(P.sun, .3) : P.sun); }));
        }
        if (P.moon && ["dove", "tabor", "cross", "ascension", "veil", "dormition", "flames", "lily"].includes(P.motif)) P.moon = null; // the feast's sign keeps the sky
        if (P.moon) {
            for (let y = 0; y < 8; y++) for (let x = 78; x < 86; x++) if ((x - 81.5) ** 2 + (y - 3.5) ** 2 <= 8.6) put(x, y, mix(P.moon, P.sky[0], .82));
            ["..###", ".##..", "##...", "##...", ".##..", "..###"].forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") put(79 + x, 1 + y, P.moon); }));
        }
        // far hills, then near ground with a light top edge (or a river)
        const far = mix(P.hill, P.sky[2], .45), rimC = phase === "night" ? lt(P.hill, .06) : lt(P.hill, .16);
        for (let x = 0; x < W; x++) {
            const hf = 10 + Math.round(1.1 * Math.sin(x / 7 + 3) + 0.7 * Math.sin(x / 3.3));
            for (let y = hf; y < H; y++) put(x, y, far);
            const hh = 11 + Math.round(1.4 * Math.sin(x / 9) + 0.8 * Math.sin(x / 4.1 + 1));
            put(x, hh, rimC); for (let y = hh + 1; y < H; y++) put(x, y, P.hill);
            const gg = gy(x);
            put(x, gg, P.top); for (let y = gg + 1; y < H; y++) put(x, y, nz(x, y) < 9 ? dk(P.ground, .16) : nz(x, y) < 14 ? lt(P.ground, .1) : P.ground);
            if (nz(x, gg) < 7) put(x, gg - 1, P.top);                                                     // tufts of grass / snow
            if (P.river && x > 28 && x < 94) { const wat = phase === "night" ? "#1c3460" : "#3f7fc8"; for (let y = gg; y < H; y++) put(x, y, wat); if ((x + (gg & 1)) % 5 === 0) put(x, gg + 1, phase === "night" ? "#4a6aa0" : "#a8d4f5"); }
        }
        const motifs = {
            dove: () => {
                const rays = "#f6e3a1"; put(74, 0, "#fff6d0");
                for (let y = 5; y <= 13; y += 2) { put(74, y, rays); put(74 - (y - 4) * .45, y, rays); put(74 + (y - 4) * .45, y, rays); }
                for (let y = 0; y < 8; y++) for (let x = 68; x < 81; x++) { const d = Math.hypot((x - 74) / 1.3, y - 2.5); if (d < 3.6) put(x, y, mix(P.sky[1], "#fff2c0", d < 2.2 ? .42 : .24)); }
                const pts = rows => rows.flatMap((r, y) => [...r].map((ch, x) => ch === "#" ? [x, y] : null).filter(Boolean));
                const A = pts(["#.......#", ".#.....#.", "..##.##..", "...###...", "....#...."]), B = pts([".........", ".........", "####.####", "...###...", "....#...."]);
                const spr = q => q.map(([x, y]) => rect(70 + x, y, "#ffffff")).join("");
                if (animate) anim.push(blink(spr(A), .9, "1;0"), blink(spr(B), .9, "0;1")); else A.forEach(([x, y]) => put(70 + x, y, "#ffffff"));
            },
            candles: () => { for (const x of [60, 66, 72, 78, 84]) { const b = gy(x); for (let y = b - 3; y < b; y++) put(x, y, "#f4efe2");
                if (animate) anim.push(blink(rect(x, b - 4, "#ffb43a"), +(.5 + (x % 7) * .08).toFixed(2), "1;1;0.55", x * .13), blink(rect(x, b - 5, "#fff2b0"), +(.9 + (x % 5) * .1).toFixed(2), "1;0", x * .21)); else put(x, b - 4, "#ffb43a"); } },
            lily: () => {
                const x = 74, b = gy(x), ray = "#f6e3a1";
                for (let i = 0; i < 9; i++) put(58 + i * 1.6, i, ray);
                for (let y = b - 6; y < b; y++) put(x, y, "#3f8a3a"); put(x - 1, b - 3, "#5fae4a"); put(x + 1, b - 2, "#5fae4a");
                for (const [dx, dy] of [[0, -9], [-1, -8], [1, -8], [-2, -7], [2, -7], [0, -8]]) put(x + dx, b + dy, "#ffffff"); put(x, b - 7, "#f3d27a");
            },
            fronds: () => { for (let x = 56; x < 92; x += 3) put(x, gy(x), "#3f8a3a"); },
            golgotha: () => {
                for (let x = 0; x < W; x++) if (x % 2 === 0) put(x, 10, "#4a1c24");
                for (let x = 62; x < 88; x++) { const top = 10 + Math.round(Math.abs(x - 75) / 3.2); for (let y = top; y < H; y++) put(x, y, "#1e1622"); }
                const c = "#8a6a30"; for (let y = 2; y < 10; y++) put(75, y, c); put(74, 3, c); put(76, 3, c); for (let x = 72; x <= 78; x++) put(x, 5, c); put(73, 8, c); put(74, 8, c); put(76, 7, c); put(77, 7, c);
            },
            ascension: () => {
                for (let x = 62; x < 90; x++) { const top = 9 + Math.round(Math.abs(x - 76) / 3); for (let y = top; y < H; y++) put(x, y, mix(P.hill, "#2a3a20", .3)); }
                const r = "#fff2b0", pts = [[72, 7], [70, 5], [76, 6], [76, 4], [80, 7], [82, 5]];
                if (animate) anim.push(blink(pts.map(([x, y]) => rect(x, y, r)).join(""), 1.4, "1;0.3")); else pts.forEach(([x, y]) => put(x, y, r));
                for (const [x, y] of [[73, 2], [74, 2], [75, 2], [76, 2], [77, 2], [78, 2], [79, 2], [74, 1], [75, 1], [76, 1], [77, 1], [78, 1]]) put(x, y, "#ffffff"); for (let x = 73; x < 80; x++) put(x, 3, "#f3d27a");
            },
            flames: () => { for (let i = 0; i < 12; i++) { const x = 57 + i * 3, y = 3 + Math.round(1.6 * Math.sin(i / 2)); put(x, y + 1, "#e0602a");
                if (animate) anim.push(blink(rect(x, y, "#ffd04a"), +(.6 + (i % 4) * .15).toFixed(2), "1;0.4", i * .17)); else put(x, y, "#ffd04a"); } },
            tabor: () => {
                for (let x = 58; x < 96; x++) { const top = Math.min(6 + Math.abs(x - 77) / 2.2, 9 + Math.abs(x - 66) / 1.6, 9 + Math.abs(x - 88) / 1.6) | 0; for (let y = top; y < H; y++) put(x, y, y === top ? "#b8a888" : "#7a6a52"); }
                put(77, 2, "#ffffff"); const pts = [[77, 0], [77, 1], [77, 3], [75, 2], [76, 2], [78, 2], [79, 2], [75, 0], [79, 0], [75, 4], [79, 4]];
                if (animate) anim.push(blink(pts.map(([x, y]) => rect(x, y, "#fff6d0")).join(""), 1.2, "1;0.35")); else pts.forEach(([x, y]) => put(x, y, "#fff6d0"));
            },
            dormition: () => {
                for (let a = 0; a < 16; a++) put(77 + 3.4 * Math.cos(a / 16 * Math.PI * 2), 4 + 2.6 * Math.sin(a / 16 * Math.PI * 2), "#d9b24e");
                put(77, 4, "#fff6d0"); motifs.lilies();
            },
            lilies: () => { for (const x of [42, 47, 58, 63, 68, 86]) { const b = gy(x); put(x, b - 1, "#3f8a3a"); put(x, b - 2, "#ffffff"); put(x - 1, b - 2, "#f4f0e4"); } },
            cornflowers: () => { for (const x of [40, 44, 49, 57, 61, 66, 71, 76, 85]) { const b = gy(x); put(x, b, "#3f7a34"); put(x, b - 1, x % 2 ? "#4a6ad8" : "#ffffff"); } },
            cross: () => {
                const c = "#ecc45a"; for (let y = 1; y <= 12; y++) put(77, y, c); for (let x = 76; x <= 78; x++) put(x, 3, c); for (let x = 73; x <= 81; x++) put(x, 5, c); put(75, 10, c); put(76, 10, c); put(78, 9, c); put(79, 8, c);
                const pts = [[73, 1], [81, 1], [72, 3], [82, 3], [72, 8], [82, 8], [74, 12], [80, 12]];
                if (animate) anim.push(blink(pts.map(([x, y]) => rect(x, y, "#fff2b0")).join(""), 1.5, "1;0.25")); else pts.forEach(([x, y]) => put(x, y, "#fff2b0"));
                for (let x = 72; x <= 82; x += 2) put(x, gy(x) - 1, "#4a9a3c");
            },
            steps: () => { for (let i = 0; i < 5; i++) for (let x = 70 + i * 4; x < 74 + i * 4; x++) for (let y = 15 - i; y < H; y++) put(x, y, y === 15 - i ? "#e8d8a8" : "#a8987a");
                for (const x of [71, 79, 87]) { const top = 15 - Math.floor((x - 70) / 4); put(x, top - 1, "#f4efe2"); put(x, top - 2, "#f4efe2");
                    if (animate) anim.push(blink(rect(x, top - 3, "#ffb43a"), .7, "1;0.5", x * .1)); else put(x, top - 3, "#ffb43a"); } },
            veil: () => { for (let a = 0; a <= 40; a++) { const t = Math.PI * a / 40, x = 77 - 17 * Math.cos(t), y = 10 - 8 * Math.sin(t); put(x, y, "#dfeaf8"); put(x, y + 1, (a % 2) ? "#d9b24e" : "#c8d8ee"); } },
            boat: () => {
                let o = ""; for (let x = 70; x <= 80; x++) o += rect(x, 13, "#6a4428"); for (let x = 71; x <= 79; x++) o += rect(x, 14, "#4a2e1a"); for (let y = 6; y < 13; y++) o += rect(75, y, "#3a2a1a");
                for (let y = 7; y < 12; y++) for (let x = 76; x <= 76 + (y - 7); x++) o += rect(x, y, "#f4efe2");
                anim.push(animate ? move(o, [[0, 0], [0, 0], [0, 1], [0, 1]], 2.4) : o);
                [".#....#.", "#.#..#.#", ".#.##.#.", "...##...", "..#..#..", ".#....#.", "#......#"].forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") put(58 + x, y, x < 4 ? "#e0c060" : "#c8ccd4"); }));
            },
        };
        // the church: three-bar cross, onion dome, drum, roof, walls, door, windows
        const cx = 100;
        if (phase === "night" || phase === "dusk") for (let x = cx - 12; x <= cx + 8; x++) for (let y = 13; y < H; y++) {
            const d = Math.hypot((x - cx) / 1.7, (y - 16) * 1.2); if (d < 7 && y >= gy(x)) put(x, y, mix(y === gy(x) ? P.top : P.ground, P.win, .3 * (1 - d / 7)));
        }
        const ol = (c) => dk(c, .55);
        for (let y = 10; y <= 15; y++) { put(cx - 5, y, ol(P.church)); put(cx + 5, y, ol(P.church)); }
        put(cx - 6, 9, ol(P.roof)); put(cx + 6, 9, ol(P.roof)); put(cx - 5, 8, ol(P.roof)); put(cx + 5, 8, ol(P.roof));
        for (const [x, y] of [[-2, 3], [2, 3], [-3, 4], [3, 4], [-3, 5], [3, 5], [-2, 6], [2, 6], [-2, 7], [2, 7]]) put(cx + x, y, y >= 6 ? ol(P.church) : ol(P.dome));
        put(cx, 0, P.dome); put(cx, 1, P.dome); put(cx, 2, P.dome); put(cx - 1, 1, P.dome); put(cx + 1, 1, P.dome);
        for (const [y, a, b] of [[3, -1, 1], [4, -2, 2], [5, -2, 2]]) for (let x = cx + a; x <= cx + b; x++) put(x, y, x > cx ? dk(P.dome, .3) : P.dome);
        put(cx - 1, 4, lt(P.dome, .45)); put(cx - 1, 3, lt(P.dome, .25));
        for (let y = 6; y <= 7; y++) for (let x = cx - 1; x <= cx + 1; x++) put(x, y, x === cx + 1 ? dk(P.church, .2) : P.church);
        put(cx, 7, dk(P.church, .4));
        for (let x = cx - 4; x <= cx + 4; x++) put(x, 8, lt(P.roof, .2));
        for (let x = cx - 5; x <= cx + 5; x++) put(x, 9, x > cx + 2 ? dk(P.roof, .2) : P.roof);
        for (let y = 10; y <= 15; y++) for (let x = cx - 4; x <= cx + 4; x++) { const c = x >= cx + 3 ? dk(P.church, .2) : x === cx - 4 ? lt(P.church, .08) : P.church; put(x, y, nz(x, y) < 12 ? dk(c, .09) : c); }
        put(cx, 12, P.door); for (let y = 13; y <= 15; y++) for (let x = cx - 1; x <= cx + 1; x++) put(x, y, P.door);
        for (const x of [cx - 3, cx, cx + 3]) { put(x, 10, dk(P.church, .22)); put(x, 11, x === cx ? dk(P.win, .15) : P.win); }
        for (let x = cx - 5; x <= cx + 5; x++) put(x, 16, Math.abs(x - cx) <= 2 ? lt(P.church, .05) : dk(P.ground, .3));
        if (phase === "night" || phase === "dusk") { put(cx - 1, 16, mix(P.win, P.ground, .6)); put(cx + 1, 16, mix(P.win, P.ground, .6)); }
        // trees
        for (const [i, tx0] of (P.treesAt || [8, 22, 36, 50, 89]).entries()) {
            const tx = tx0 + (nz(tx0, 1) % 3) - 1, kind = P.treesAt ? "round" : ["round", "poplar", "round", "bush", "round"][i % 5];
            const col = mix(P.tree2 && i % 2 ? P.tree2 : P.tree, i % 3 === 0 ? "#000000" : "#ffffff", .06), base = 13 + Math.round(Math.sin(tx / 13 + 2));
            if (P.trees !== "palm") { put(tx - 1, base + 1, dk(P.top, .28)); put(tx + 1, base + 1, dk(P.top, .28)); put(tx + 2, base + 1, dk(P.top, .15)); }
            if (P.trees === "fir") {
                for (const [dy, w] of [[-5, 0], [-4, 1], [-3, 1], [-2, 2], [-1, 2]]) for (let x = tx - w; x <= tx + w; x++) put(x, base + dy, x > tx ? dk(col, .28) : x === tx - w && w ? lt(col, .14) : col);
                put(tx, base, P.trunk);
                if (["winter", "nativity", "nativityfast", "theophany", "meeting"].includes(key)) { const sn = phase === "night" ? "#9aa4b8" : "#ffffff"; put(tx, base - 5, sn); put(tx - 1, base - 3, sn); put(tx + 2, base - 1, sn); }
            } else if (P.trees === "palm") {
                for (let y = base - 4; y <= base; y++) put(tx + (y < base - 2 ? 1 : 0), y, P.trunk);
                for (const [dx, dy] of [[-2, -5], [-1, -5], [0, -6], [1, -6], [2, -6], [3, -5], [4, -5], [-3, -4], [5, -4], [1, -5]]) put(tx + dx, base + dy, col);
            } else {
                const big = i % 3 === 1 ? 1 : 0, can = new Set();
                const [r2, clumps] = kind === "poplar" ? [1.7, [[tx, base - 3], [tx, base - 5], [tx, base - 7]]] : kind === "bush" ? [1.9, [[tx - 1, base], [tx + 1, base], [tx, base - 1]]]
                    : [2.3 + big * 1.1, [[tx - 1, base - 3], [tx + 1, base - 3], [tx, base - 4 - big]]];
                for (let y = base - 9; y <= base + 1; y++) for (let x = tx - 4; x <= tx + 4; x++)
                    if (clumps.some(([qx, qy]) => (x - qx) ** 2 + (y - qy) ** 2 <= r2) && !(y === base - 1 && kind !== "bush" && nz(x, y) < 45)) can.add(x + "," + y);
                for (const k of can) { const [x, y] = k.split(",").map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!can.has((x + dx) + "," + (y + dy)) && !(dy === 1 && kind !== "bush" && x === tx)) put(x + dx, y + dy, dk(col, .55)); }
                for (const k of can) { const [x, y] = k.split(",").map(Number), L = !can.has((x - 1) + "," + y), Rr = !can.has((x + 1) + "," + y), B = !can.has(x + "," + (y + 1)), T = !can.has(x + "," + (y - 1));
                    put(x, y, (Rr || B) ? dk(col, .3) : L || (T && x <= tx) ? lt(col, .2) : nz(x, y) < 10 ? lt(col, .32) : col); }
                if (P.fall === "leaf" || key === "protection" || key === "exaltation") for (const dx of [-3, 2, 3]) if (nz(tx + dx, base) < 70) put(tx + dx, base + 2, col);
                if (kind !== "bush") { put(tx, base, P.trees === "birch" ? "#f2f2ec" : P.trunk); put(tx, base + 1, P.trees === "birch" ? "#2a2a2a" : P.trunk); }
                if (key === "transfiguration" && i % 2 === 0) { put(tx - 1, base - 3, "#d83a2a"); put(tx + 1, base - 4, "#d83a2a"); put(tx + 1, base - 2, "#e8b03a"); }
            }
        }
        // ---- St Sergius: the carpenter's wattle fence, the season's small things by it, near bushes and the forest creatures ----
        const nat = P.fall === "snow" ? "winter" : P.fall === "petal" ? "spring" : P.fall === "sparkle" ? "summer" : "autumn";
        const sober = key === "lent" || key === "holyweek", calm = sober || P.rain || (P.fixedSky && key !== "pascha");
        const tod = c => key === "holyweek" ? mix(c, "#0c0a10", .62) : key === "lent" ? mix(mix(c, "#5a5068", .45), "#120a10", .2)
            : P.fixedSky || phase === "day" ? c : mix(c, phase === "night" ? "#04060e" : "#120a10", phase === "night" ? .55 : phase === "dawn" ? .18 : .28);
        const pal = o => Object.fromEntries(Object.entries(o).map(([k, c]) => [k, tod(c)]));
        const draw = (x0, y0, rows, pl, to = put) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pl[ch]) to(x0 + x, y0 + y, pl[ch]); }));
        const snowy = nat === "winter" && !sober, snowC = phase === "night" ? "#a8b2c8" : tod("#ffffff");
        const fence = !P.river && !["candles", "steps", "golgotha", "ascension", "tabor", "boat"].includes(P.motif);
        const F0 = 56, F1 = 84, posts = [56, 63, 70, 77, 84], perchY = {};
        if (fence) {
            const wd = pal({ o: "#2e1e12", d: "#5a3c24", m: "#8a6440", l: "#b8915e", h: "#d6b27a" });
            for (let x = F0; x <= F1; x++) {
                const b = gy(x), post = posts.includes(x), i = x - posts.filter(p => p <= x).pop();
                put(x, b, dk(P.top, .3));                                                       // its shadow on the grass
                if (post) { put(x, b - 4, wd.l); put(x, b - 3, wd.d); put(x, b - 2, wd.d); put(x, b - 1, wd.o); if (snowy) put(x, b - 5, snowC); perchY[x] = b - (snowy ? 5 : 4); continue; }
                // woven withies: two lit rows over a shadowed one, the weave turning every two pixels
                put(x, b - 3, i === 1 ? wd.m : (i >> 1) % 2 ? wd.l : wd.h);
                put(x, b - 2, i === 6 ? wd.o : (i >> 1) % 2 ? wd.m : wd.l);
                put(x, b - 1, wd.o);
                if (snowy) put(x, b - 4, snowC);
            }
            // by the fence: pumpkins and a woodpile in autumn, a snowy woodpile in winter
            const logs = pal({ o: "#2e1e12", b: "#4a2e1a", B: "#6a4428", c: "#f0d098", s: snowy ? "#ffffff" : null });
            if (snowy && phase === "night") logs.s = snowC;
            if (!sober && (nat === "autumn" || nat === "winter") && !P.motif) draw(64, gy(64) - 4, ["...sss..", "..oBBBc.", ".obbbbbc", "oBBBBBBc"].map(r => snowy ? r : r.replace(/s/g, ".")), logs);
            if (!sober && nat === "autumn") for (const px of [59, 80]) draw(px, gy(px) - 3, ["..g.", "olPp", "oPPd"], pal({ g: "#5a7a2a", o: "#8a3a12", l: "#f8b860", P: "#e07a28", p: "#c0601e", d: "#7a3412" }));
        }
        if (P.motif && motifs[P.motif]) motifs[P.motif]();
        // the monastery cat, by the church wall
        const catC = phase === "night" ? "#4a3020" : phase === "day" ? "#c8783a" : "#9a5a2a", cy0 = gy(92) - 1;
        for (const [x, y] of [[91, cy0 - 3], [93, cy0 - 3], [91, cy0 - 2], [92, cy0 - 2], [93, cy0 - 2], [92, cy0 - 1], [93, cy0 - 1], [92, cy0], [93, cy0], [94, cy0]]) put(x, y, catC);
        put(94, cy0 - 1, catC); put(92, cy0 - 2, dk(catC, .35)); put(93, cy0, dk(catC, .3)); put(91, cy0 - 3, dk(catC, .4)); put(93, cy0 - 3, dk(catC, .4));
        if (animate) {
            anim.push(blink(rect(95, cy0 - 1, catC) + rect(95, cy0 - 2, catC) + rect(96, cy0 - 3, catC), 4.2, "1;1;1;0", .7), blink(rect(95, cy0, catC) + rect(96, cy0, catC) + rect(97, cy0 - 1, catC), 4.2, "0;0;0;1", .7)); // tail curls and flicks
            if (phase === "night" || phase === "dusk") anim.push(blink(rect(91, cy0 - 2, "#e8d040") + rect(93, cy0 - 2, "#e8d040"), 5, "1;1;1;1;0", 1)); // eyes, blinking
        } else { put(95, cy0 - 1, catC); put(95, cy0 - 2, catC); put(96, cy0 - 3, catC); }
        // a hanging lampada in the fasts
        if (P.lamp) {
            const lx = 62; put(lx, 0, "#8a7040"); put(lx - 1, 1, "#8a7040"); put(lx + 1, 1, "#8a7040"); for (let x = lx - 2; x <= lx + 2; x++) put(x, 3, "#d9b24e");
            put(lx - 1, 4, "#c8322a"); put(lx, 4, "#c8322a"); put(lx + 1, 4, "#c8322a"); put(lx, 5, "#7e1c18");
            if (animate) anim.push(blink(rect(lx, 2, "#ffb43a"), .8, "1;1;0.5"), blink(rect(lx, 1, "#fff2b0"), 1.3, "0;1;0", .4)); else put(lx, 2, "#ffb43a");
        }
        // Paschal red eggs in the grass
        if (P.eggs) for (const ex of [40, 45, 76, 84]) { put(ex, 15, P.eggs); put(ex + 1, 15, P.eggs); put(ex, 14, P.eggs); }

        // the near ground (its own layer, drawn over the creatures so they can pass behind): wildflowers and bushes with an outline, a lit and a shaded side
        const near = new Array(W * H).fill(null), putN = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < W && y < H) near[y * W + x] = c; };
        const flowery = !sober && !calm && phase !== "night" && (nat === "spring" || nat === "summer") && !["cornflowers", "lilies", "dormition", "fronds", "candles", "lily"].includes(P.motif);
        if (flowery && fence) for (const [fx, a, c2] of nat === "spring" ? [[58, "#f4d23a", "#ffffff"], [67, "#ffffff", "#8aa8f0"], [74, "#f4d23a", "#f4d23a"], [82, "#f0a0c8", "#ffffff"]]
            : [[58, "#e0402a", "#ffffff"], [66, "#ffffff", "#e0402a"], [75, "#7a9ae8", "#e0402a"], [81, "#e0402a", "#ffffff"]]) {
            const b = gy(fx), st = tod("#3f7a34");
            put(fx, b - 1, st); put(fx + 2, b - 1, st); put(fx + 1, b, st); put(fx, b - 2, tod(a)); put(fx + 2, b - 2, tod(c2)); put(fx + 1, b - 1, tod(a));
        }
        const leafC = sober ? "#4a5a48" : { spring: "#4f9a3e", summer: "#3f7a34", autumn: "#c8582a", winter: "#2f5a44" }[nat];
        const bushes = [[25, ["..ooo..ooo...", ".oLfmo.oLLmo.", "oLLmmdoLmfmdo", "oLmfdLLmmmddo", "omddmmmdfddo."]], [51, ["..oo.ooo..", ".oLLoLfmo.", "oLfmdLmmdo", "omdmmmfddo"]]];
        const fl = !sober && phase !== "night" && { spring: "#ffffff", summer: "#e86a8a", autumn: "#e0282a" }[nat];  // f: blossom, wild roses, rowan berries
        for (const [bx, rows] of bushes) {
            const bp = { o: dk(leafC, .55), L: lt(leafC, .22), m: leafC, d: dk(leafC, .28) }, top = H - rows.length;
            bp.f = fl || bp.L;
            draw(bx, top, rows, pal(bp), putN);
            if (snowy) rows.forEach((r, y) => [...r].forEach((ch, x) => { if ("oLf".includes(ch) && (y === 0 || (rows[y - 1][x] || ".") === ".")) putN(bx + x, top + y, snowC); })); // snow lies on the top
        }

        // a creature: sprite frames (rows of letters) and steps [x, y, frame (-1 hidden), seconds], all on one discrete clock
        const spr = (rows, pl) => rows.flatMap((r, y) => [...r].map((ch, x) => pl[ch] ? rect(x, y, pl[ch]) : "")).join("");
        const flip = rows => rows.map(r => [...r].reverse().join(""));
        const act = (frames, steps, begin) => {
            const T = steps.reduce((a, s) => a + s[3], 0); let t = 0;
            const kt = steps.map(s => { const k = Math.round(t / T * 1e6) / 1e6; t += s[3]; return k; }).join(";");
            const tail = `dur='${+T.toFixed(2)}s' begin='${(-begin).toFixed(2)}s' keyTimes='${kt}' calcMode='discrete' repeatCount='indefinite'`;
            return `<g>${frames.map((f, k) => `<g opacity='${+(steps[0][2] === k)}'>${f}<animate attributeName='opacity' values='${steps.map(s => +(s[2] === k)).join(";")}' ${tail}/></g>`).join("")}<animateTransform attributeName='transform' type='translate' values='${steps.map(s => s[0] + " " + s[1]).join(";")}' ${tail}/></g>`;
        };
        const creatures = [], away = [-20, 0, -1], bearDay = Math.imul(Math.floor((opt.clock || 0) / 86400) + 7, 2654435761) >>> 28 < 3;
        if (!calm && phase !== "night" && fence) { // a robin (a bullfinch in winter) comes to the fence posts and hops along them
            const bp = pal(snowy ? { k: "#1e1a20", g: "#7a7a88", r: "#e8643e", w: "#e8e4ea" } : { k: "#5a3e26", g: "#7a5638", r: "#e8642c", w: "#f0dcc0" });
            const A = ["..kk.", "ggrr.", ".gw.."], B = [".....", ".kk..", "ggrr."], St = [];
            const at = (px, f, s) => [px - 2, perchY[px] - 3, f, s];
            St.push([...away, 60], [posts[1] - 6, perchY[posts[1]] - 6, 0, .25]);
            for (const [j, px] of [posts[1], posts[2], posts[3]].entries()) {
                if (j) St.push([px - 5, perchY[px] - 4, 0, .2]);
                St.push(at(px, 0, 1.6), at(px, 1, .35), at(px, 0, 2.2), at(px, 1, .3), at(px, 0, 1.4));
            }
            St.push([posts[3] + 1, perchY[posts[3]] - 6, 0, .25], [posts[3] + 5, perchY[posts[3]] - 9, 0, .25]);
            creatures.push({ frames: [spr(flip(A), bp), spr(flip(B), bp)], steps: St, off: 7, still: () => draw(posts[2] - 2, perchY[posts[2]] - 3, flip(A), bp) });
        }
        if (!calm && !P.river && !P.motif) {
            const hp = pal({ b: "#a88462", l: "#d0b08a", d: "#5a4430", w: "#f4f0ea", k: "#1a1210" });
            if ((nat === "spring" || nat === "summer") && phase === "day") { // a hare crosses the near meadow, sits up, goes on
                const A = ["....l.", "...lbk", "wbbbb.", ".d.bd."], B = [".....l", "wbbbbk", "d....d"], S = ["....l.", "....lk", "...bb.", "wbbbb."], St = [[...away, 100]];
                for (let x = -6; x < 110; x += 4) { const y = gy(x) - 2; St.push([x, y, 0, .45], [x + 2, y - 1, 1, .16]); if (x === 42) St.push([x + 4, y - 1, 2, 2.6], [x + 4, y, 0, .8], [x + 4, y - 1, 2, 1.8]); }
                creatures.push({ frames: [spr(A, hp), spr(B, hp), spr(S, hp)], steps: St, off: 31 });
            } else if ((nat === "summer" || nat === "autumn") && phase === "day" && fence) { // instead of the robin, a red squirrel runs the fence top
                const sp = pal({ t: "#c8501a", b: "#d86a2a", w: "#f0c8a0", e: "#8a3010", k: "#1a1008" });
                const A = ["t.....", "tt..e.", ".tbbbk", "..b.b."], B = ["tt.e.", "t..bk", "t.bbw", ".tbb."], St = [[...away, 40]];
                for (let x = F0 - 6; x <= F1 + 2; x += 2) { St.push([x, gy(x) - 8, 0, .14]); if (x === 66) St.push([x, gy(x) - 8, 1, 2.4], [x, gy(x) - 8, 0, .3], [x, gy(x) - 8, 1, 1.6]); }
                St.push([F1 + 4, gy(F1) - 10, 0, .2], [F1 + 6, gy(F1) - 11, -1, .1]);
                creatures.splice(0, 1, { frames: [spr(A, sp), spr(B, sp)], steps: St, off: 11 });
            } else if (nat !== "winter" && (phase === "dusk" || phase === "night")) { // a hedgehog comes out of one bush and goes into the other
                const hh = pal({ d: "#4a3a2a", l: "#8a7058", f: "#c8a880", k: "#120a08" }), A = [".lll..", "ldlldf", ".d.d.k"], B = [".lll..", "ldlldf", "d.d..k"], St = [[...away, 70]];
                for (let x = 30; x <= 56; x++) St.push([x, gy(x) - 1, x % 2, x === 42 ? 3 : .55]);
                creatures.push({ frames: [spr(A, hh), spr(B, hh)], steps: St, off: 5 });
            } else if (nat !== "winter" && phase === "dawn" && bearDay) { // very rarely (about one dawn in five), St Sergius's bear comes to the fence, stands a while, and goes back to the forest
                const bb = pal({ l: "#7a5232", b: "#5a3a22", d: "#2e1c10", s: "#a07a52", e: "#100806" });
                const A = ["..lll..l.", ".lbbblbbe", "bbbbbbbbs", "bbbbbbbb.", ".d.d..d.d"], B = ["..lll..l.", ".lbbblbbe", "bbbbbbbbs", "bbbbbbbb.", "d.d..d.d."], St = [[...away, 900]];
                const S = ["..lll....", ".lbbbl.l.", "bbbbbbbbe", "bbbbbbbbs", ".d.d..d.d"];
                for (let x = -10; x <= 40; x++) St.push([x, gy(x) - 3, x & 1, .42]);
                St.push([40, gy(40) - 3, 2, 6], [40, gy(40) - 3, 0, 2.5], [40, gy(40) - 3, 2, 5]);
                for (let x = 40; x >= -10; x--) St.push([x, gy(x) - 3, 3 + (x & 1), .42]);
                creatures.push({ frames: [spr(A, bb), spr(B, bb), spr(S, bb), spr(flip(A), bb), spr(flip(B), bb)], steps: St, off: 400 });
            } else if (nat === "winter" && (phase === "day" || phase === "dawn")) { // a fox trots over the snow, stops to listen, and is gone
                const fx = pal({ o: "#d8642a", l: "#f08a4a", w: "#f4f0ea", d: "#3a2010", k: "#100806" });
                // pointed ears, white muzzle and chest, a brush with a white tip; it stands on the snow line, not sunk in it (redrawn, round 2)
                const A = [".d.d........", ".lol......lw", "kwloooooooo.", "..wooooooo..", "..d.d..d.d.."], B = [".d.d........", ".lol......lw", "kwloooooooo.", "..wooooooo..", "...dd...dd.."];
                const S = [".d.d........", ".lol........", "kwlooooooo..", "..woooooooo.", "..d.d..d.dlw"], St = [[...away, 90]];
                for (let x = 110; x >= -10; x -= 2) { St.push([x, gy(x) - 4, (x >> 1) & 1, .22]); if (x === 36) St.push([x, gy(x) - 4, 2, 3]); }
                creatures.push({ frames: [spr(A, fx), spr(B, fx), spr(S, fx)], steps: St, off: 17 });
            }
        }

        // ---- moving things ----
        if (animate) {
            anim.push(blink([cx - 3, cx + 3].map(x => rect(x, 11, dk(P.win, .3))).join(""), 3.1, "0;0;1;0;0;0;1", 1.3)); // candlelight in the windows
            anim.push(blink(rect(cx + 1, 0, "#ffffff"), 9, "0;0;0;0;0;0;0;0;1", 2));                                              // the cross catches the light
            // falling snow / petals / leaves; summer sparkles twinkle in place
            for (let i = 0; i < (P.parts || 0) && P.part; i++) {
                const x0 = Math.floor(rnd() * W), c = P.part2 && i % 3 === 0 ? P.part2 : P.part;
                if (P.fall === "sparkle") { anim.push(blink(rect(x0, 1 + Math.floor(rnd() * 9), c), +(1.5 + rnd() * 2).toFixed(2), "0;1;0;0", rnd() * 3)); continue; }
                const pts = [], dx = P.fall === "petal" ? 1 : P.fall === "leaf" ? .5 : 0;
                for (let y = -1; y <= 15; y++) pts.push([Math.round(dx * (y + 1) + (P.fall === "snow" && y % 4 === 1 ? 1 : 0)), y]);
                const dur = +(pts.length * (P.fall === "snow" ? .42 : .3)).toFixed(2);
                const farFlake = P.fall === "snow" && i % 2;
                anim.push(move(rect(x0, 0, farFlake ? mix(c, s0, .45) : c), pts, farFlake ? +(dur * 1.5).toFixed(2) : dur, rnd() * dur));
            }
            // fireflies on summer nights
            for (let i = 0; i < (P.fireflies || 0); i++) {
                const x0 = 6 + Math.floor(rnd() * 90), y0 = 9 + Math.floor(rnd() * 5), pts = [];
                for (let k = 0; k < 12; k++) pts.push([Math.round(2 * Math.sin(k / 2 + i)), Math.round(Math.cos(k / 3 + i))]);
                anim.push(blink(move(rect(x0, y0, "#e8f070"), pts, 7.2, rnd() * 7), +(1.1 + rnd()).toFixed(2), "1;0.2;1", rnd() * 2));
            }
            // drifting clouds
            for (let i = 0; i < (P.clouds || 0); i++) {
                const y0 = 1 + i * 3, cl = mix(P.sky[0], "#ffffff", phase === "day" ? .85 : .55), cs = mix(P.sky[0], "#ffffff", phase === "day" ? .65 : .35);
                let spr = ""; for (let x = 1; x <= 4; x++) spr += rect(x, y0, cl); for (let x = 0; x <= 6; x++) spr += rect(x, y0 + 1, x === 0 || x === 6 ? cs : cl);
                const pts = []; for (let x = -8; x <= W; x++) pts.push([x, 0]);
                const dur = +(pts.length * 1.6).toFixed(1);
                anim.push(move(spr, pts, dur, rnd() * dur));
            }
            const monk = (robe, hood, lamp) => rect(1, 0, hood) + rect(0, 1, hood) + rect(1, 1, robe) + rect(2, 1, robe) + rect(0, 2, robe) + rect(1, 2, robe) + rect(2, 2, robe) + rect(0, 3, robe) + rect(1, 3, robe) + rect(2, 3, robe)
                + blink(rect(0, 4, robe) + rect(2, 4, robe), .52, "1;0") + blink(rect(1, 4, robe), .52, "0;1") + (lamp ? blink(rect(3, 2, "#ffc04a"), .7, "1;1;0.55") + rect(3, 3, "#f4efe2")
                : rect(3, 0, "#8a6a44") + rect(3, 1, "#7a5a3a") + rect(3, 2, "#7a5a3a") + rect(3, 3, "#7a5a3a") + rect(3, 4, "#6a4a2e"));
            // Pascha: a procession with candles goes round the church
            if (key === "pascha") {
                const path = []; for (let x = 96; x >= 52; x--) path.push([x, gy(x) - 5]); for (let x = 52; x <= 96; x++) path.push([x, gy(x) - 5]);
                const dur = +(path.length * .3).toFixed(1);
                for (let k = 0; k < 3; k++) anim.push(move(monk(k === 0 ? "#6a1414" : "#14110f", k === 0 ? "#d9b24e" : "#3c342c", true), path, dur, k * 1.5));
            }
            // a monk walks to church now and then (with a lantern after dark)
            else if (key !== "holyweek" || phase !== "night") {
                const robe = phase === "night" ? "#060506" : "#14110f", step = .26, walk = [], hold = 150;
                for (let x = -4; x <= 97; x++) walk.push([x, gy(x) - 5]);
                const pts = [...walk, ...Array(hold).fill([-12, 0])], dur = +(pts.length * step).toFixed(2);
                const hood = phase === "night" ? "#1c1814" : "#3c342c";
                anim.push(move(monk(robe, hood, phase === "night" || phase === "dusk"), pts, dur, (key.length * 7) % 40));
            }
            // bells on Sundays and feast days (morning and day)
            if (opt.bells) {
                const bell = "#e0b850";
                anim.push(blink(rect(cx - 1, 7, bell), .8, "1;0"), blink(rect(cx + 1, 7, bell), .8, "0;1"));
                for (let k = 0; k < 4; k++) {
                    const side = k % 2 ? 1 : -1, pts = []; for (let y = 0; y < 5; y++) pts.push([side * (3 + y % 2), -y]);
                    pts.push([-40, 0], [-40, 0], [-40, 0]);
                    anim.push(move(rect(cx, 6, "#fff2b0"), pts, 3.2, k * .8));
                }
            }
            // rain
            if (P.rain) for (let i = 0; i < 28; i++) {
                const x0 = Math.floor(rnd() * (W + 10)) - 4, pts = [];
                for (let y = -2; y <= 16; y += 2) pts.push([Math.round((y + 2) / 4), y]);
                anim.push(move(rect(x0, 0, i % 2 ? "#aebcd8" : "#8c9cbc") + rect(x0, 1, "#6a7c9c"), pts, +(pts.length * (i % 2 ? .055 : .085)).toFixed(3), rnd()));
            }
            // birds
            const bc = P.birdC || (phase === "day" ? "#2a2420" : "#1a1218");
            for (let i = 0; i < (P.birds || 0); i++) {
                const y0 = 2 + Math.floor(rnd() * 5), up = [[0, 0], [2, 0], [1, 1]], down = [[1, 0], [0, 1], [2, 1]];
                const fr = (pts, v) => blink(pts.map(([x, y]) => rect(x, y0 + y, bc)).join(""), .36, v);
                const path = []; for (let x = -4; x <= W + 2; x++) path.push([x, Math.round(Math.sin(x / 6 + i * 2))]);
                const dur = +(path.length * .16).toFixed(2);
                anim.push(move(fr(up, "1;0") + fr(down, "0;1"), path, dur, i * dur / Math.max(1, P.birds) + rnd() * 3));
            }
            // the forest creatures: a few, rare, by season and hour; each walks its own clock (set by the wall clock, so a refocus does not replay it)
            for (const c of creatures) anim.push(act(c.frames, c.steps, ((opt.clock || 0) + c.off) % c.steps.reduce((a, s) => a + s[3], 0)));
        } else {
            for (const c of creatures) if (c.still) c.still();
            for (let i = 0; i < (P.parts || 0); i++) put(Math.floor(rnd() * W), Math.floor(rnd() * 14), P.part2 && i % 3 === 0 ? P.part2 : P.part);
        }

        // one path per colour, horizontal runs merged
        const merged = grid => { const runs = {}; for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const c = grid[y * W + x]; let n = 1; while (x + n < W && grid[y * W + x + n] === c) n++; if (c) (runs[c] ||= []).push(`M${x} ${y}h${n}v1h-${n}z`); x += n; } }
            return Object.entries(runs).map(([c, d]) => `<path fill='${c}' d='${d.join("")}'/>`).join(""); };
        const paths = merged(g);
        return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='xMidYMid slice' shape-rendering='crispEdges'>${paths}${anim.join("")}${merged(near)}</svg>`;
    }
    static url(key, opt) { return `url("data:image/svg+xml,${encodeURIComponent(SeasonArt.scene(key, opt))}")`; }

    /* ---- St Sergius: the Home banner, a picture of its own. The monastery seen from across its lake: a skete on the far hill, the brothers' cells
       with smoking chimneys, the five-domed church and the bell tower (right, where Home rings the bell), the domes in the water, the season's field
       on the left, and creatures of the lake and the forest edge. Same season, feast, hour and weather as the bar below. (tested) ---- */
    static banner(key, opt = {}) {
        const W = BW, H = BH, phase = opt.phase || "day", animate = opt.animate !== false, night = phase === "night", dark = night || phase === "dusk";
        const P = SeasonArt.shade(PAL[key] || PAL.autumn, phase), g = new Array(W * H).fill(null), front = new Array(W * H).fill(null), anim = [], over = [];
        if (opt.weather === "rain") { P.sky = P.sky.map(c => mix(c, "#5a606a", .45)); P.sun = null; P.birds = 0; P.parts = 0; P.clouds = 3; P.rain = true; P.fireflies = 0; }
        const put = (x, y, c, to = g) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < W && y < H) to[y * W + x] = c; };
        let s = 29 + key.length * 211 + PHASES.indexOf(phase) * 37; const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        const dk = (c, t) => mix(c, "#000000", t), lt = (c, t) => mix(c, "#ffffff", t);
        const rect = (x, y, c) => `<rect x='${Math.round(x)}' y='${Math.round(y)}' width='1' height='1' fill='${c}'/>`;
        const blink = (inner, dur, vals, begin = 0) => `<g opacity='${vals.split(";")[0]}'>${inner}<animate attributeName='opacity' values='${vals}' dur='${dur}s' begin='${(-begin).toFixed(2)}s' calcMode='discrete' repeatCount='indefinite'/></g>`;
        const move = (inner, pts, dur, begin = 0) => `<g>${inner}<animateTransform attributeName='transform' type='translate' values='${pts.map(p => p.join(" ")).join(";")}' dur='${dur}s' begin='${(-begin).toFixed(2)}s' calcMode='discrete' repeatCount='indefinite'/></g>`;
        const draw = (x0, y0, rows, pl, to = g) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pl[ch]) put(x0 + x, y0 + y, pl[ch], to); }));
        const spr = (rows, pl) => { const d = {}; rows.forEach((r, y) => { for (let x = 0; x < r.length;) { let n = 1; while (r[x + n] === r[x]) n++; if (pl[r[x]]) (d[pl[r[x]]] ||= []).push(`M${x} ${y}h${n}v1h-${n}z`); x += n; } });
            return Object.entries(d).map(([c, q]) => `<path fill='${c}' d='${q.join("")}'/>`).join(""); }; // a sprite as one path per colour
        const flip = rows => rows.map(r => [...r].reverse().join(""));
        const nat = P.fall === "snow" ? "winter" : P.fall === "petal" ? "spring" : P.fall === "sparkle" ? "summer" : "autumn";
        const sober = key === "lent" || key === "holyweek", calm = sober || P.rain || key === "theophany" || (P.fixedSky && key !== "pascha"), snowy = nat === "winter" && !sober;
        const tod = c => !c ? c : key === "holyweek" ? mix(c, "#0c0a10", .62) : key === "lent" ? mix(mix(c, "#5a5068", .45), "#120a10", .2)
            : P.fixedSky || phase === "day" ? c : mix(c, night ? "#04060e" : "#120a10", night ? .55 : phase === "dawn" ? .18 : .28);
        const pal = o => Object.fromEntries(Object.entries(o).map(([k, c]) => [k, tod(c)]));
        const snowC = night ? "#a8b2c8" : tod("#ffffff"), gold = tod("#e0c060");

        // sky in bands, a soft glow round the moon at night
        const [s0, s1, s2] = P.sky, band = [0, 0, 0, .2, .2, .2, .4, .4, .4, .6, .6, .6, .8, .8, .8, 1, 1, 1, 1.3, 1.3, 1.6, 1.6, 1.8];
        const sky = y => { const t = band[Math.min(y, band.length - 1)]; return t <= 1 ? mix(s0, s1, t) : mix(s1, s2, t - 1); };
        const SX = 88; // the sun and the moon stand over the open water, between the skete and the monastery
        for (let y = 0; y < 23; y++) for (let x = 0; x < W; x++) {
            let c = sky(y); if (night && !P.fixedSky) { const d = Math.floor(Math.hypot((x - SX) / 1.8, y - 6) / 4); if (d < 3) c = mix(c, "#3a3458", [.22, .13, .06][d]); }
            put(x, y, c);
        }
        for (let i = 0; i < (P.stars || 0) * 2; i++) {
            const x = Math.floor(rnd() * W), y = Math.floor(rnd() * 15);
            if (animate && i % 4 === 0) anim.push(blink(rect(x, y, "#dfe6ff"), +(2 + (i % 5) * .7).toFixed(1), "1;0.15;1;1", rnd() * 4)); else put(x, y, i % 4 ? "#b8c4ee" : "#ffffff");
        }
        if (P.sun) {
            const cy = key === "pascha" ? 14 : P.low ? 13 : 6, r = key === "pascha" ? 4.3 : 3.3;
            for (let y = cy - 7; y <= cy + 7; y++) for (let x = SX - 7; x <= SX + 7; x++) { const d = Math.hypot(x - SX, y - cy);
                if (d < r) put(x, y, d < r - 1.3 && x - SX + y - cy < -1 ? lt(P.sun, .35) : P.sun); else if (d < r + 1.8) put(x, y, mix(sky(y), P.sun, .25)); }
            if (key === "pascha") { const rays = [[0, -7], [0, -8], [-6, -5], [6, -5], [-7, 0], [7, 0], [-8, 0], [8, 0], [-5, -6], [5, -6]].map(([dx, dy]) => rect(SX + dx, cy + dy, "#fff6d0")).join("");
                if (animate) anim.push(blink(rays, 1.1, "1;0.2;1;0.6")); } // "the sun plays" on Pascha morning
        }
        if (P.moon && ["dove", "tabor", "cross", "ascension", "veil", "dormition", "lily"].includes(P.motif)) P.moon = null;
        if (P.moon) for (let y = 1; y < 12; y++) for (let x = SX - 5; x <= SX + 5; x++) { const d = Math.hypot(x - SX, y - 6);
            if (d < 3.6) put(x, y, Math.hypot(x - SX - 1.7, y - 5.2) < 3.1 ? mix(P.moon, s0, .78) : d > 2.6 && x < SX ? lt(P.moon, .2) : P.moon); }
        if (P.star) { // the star of Bethlehem stands over the skete, its beam going down to it
            const sx = 38, sy = 3; for (let d = -3; d <= 3; d++) { put(sx + d, sy, P.star); put(sx, sy + d, P.star); } put(sx - 1, sy - 1, P.star); put(sx + 1, sy + 1, P.star); put(sx + 1, sy - 1, P.star); put(sx - 1, sy + 1, P.star);
            for (let y = sy + 4; y < 9; y++) put(sx, y, mix(P.sky[1], P.star, .5));
            if (animate) anim.push(blink([[-5, 0], [5, 0], [0, -5], [-4, -4], [4, -4]].map(([dx, dy]) => rect(sx + dx, sy + dy, P.star)).join(""), 1.6, "1;0"));
        }
        if (!night && !P.rain && !P.fixedSky) { // clouds resting low over the hills
            const cc = mix(s1, "#ffffff", phase === "day" ? .42 : .24), rim = mix(s1, "#ffffff", phase === "day" ? .64 : .38);
            for (const [x0, y0, rows] of [[14, 9, ["......#######.....", "..##############..", "##################"]], [116, 10, ["....######.......", ".###############.", "#################"]]])
                rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") put(x0 + x, y0 + y, y === 0 || r[x - 1] !== "#" ? rim : cc); }));
        }

        // far hills (the skete's hill, a second hill for the feasts' signs), a nearer ridge, the forest along the far shore
        const hf = x => Math.round(17 - 5.5 * Math.exp(-(((x - 38) / 13) ** 2)) - 3.6 * Math.exp(-(((x - 70) / 9) ** 2)) + .8 * Math.sin(x / 9) + .5 * Math.sin(x / 4.3 + 1));
        const far = mix(P.hill, s2, .5), nearR = mix(P.hill, s2, .22);
        for (let x = 0; x < W; x++) {
            const t = hf(x); put(x, t, lt(far, .14)); for (let y = t + 1; y < 22; y++) put(x, y, far);
            const n = Math.round(19 + 1.1 * Math.sin(x / 11 + 1) + .6 * Math.sin(x / 5)); put(x, n, lt(nearR, .1)); for (let y = n + 1; y < 22; y++) put(x, y, nearR);
        }
        const motifs = {
            golgotha: () => { for (let x = 0; x < W; x += 3) put(x, 15, "#4a1c24"); const c = "#120c14", t = hf(70); for (let y = t - 7; y < t; y++) put(70, y, c); for (let x = 67; x <= 73; x++) put(x, t - 5, c); put(69, t - 2, c); put(71, t - 3, c); },
            ascension: () => { const t = hf(70), r = "#fff2b0"; for (const [x, y] of [[66, 6], [67, 8], [70, 4], [70, 6], [73, 8], [74, 6]]) put(x, y, mix(sky(y), r, .6));
                for (let x = 65; x <= 75; x++) put(x, 2, x === 65 || x === 75 ? lt(s0, .5) : "#ffffff"); for (let x = 66; x <= 74; x++) put(x, 3, "#f3d27a");
                if (animate) anim.push(blink([[68, t - 2], [72, t - 2], [70, t - 3]].map(([x, y]) => rect(x, y, r)).join(""), 1.4, "1;0.3")); },
            tabor: () => { const t = hf(70); put(70, t - 1, "#ffffff"); const pts = [[70, t - 3], [70, t - 5], [67, t - 2], [73, t - 2], [65, t - 4], [75, t - 4], [70, t - 7]];
                if (animate) anim.push(blink(pts.map(([x, y]) => rect(x, y, "#fff6d0")).join(""), 1.2, "1;0.35")); else pts.forEach(([x, y]) => put(x, y, "#fff6d0")); },
            cross: () => { const c = "#ecc45a", t = hf(70); for (let y = 2; y < t - 1; y++) put(70, y, c); for (let x = 69; x <= 71; x++) put(x, 3, c); for (let x = 66; x <= 74; x++) put(x, 5, c); put(69, 9, c); put(71, 8, c);
                const pts = [[66, 2], [74, 2], [64, 5], [76, 5], [65, 9], [75, 9], [67, 12], [73, 12]];
                if (animate) anim.push(blink(pts.map(([x, y]) => rect(x, y, "#fff2b0")).join(""), 1.5, "1;0.25")); else pts.forEach(([x, y]) => put(x, y, "#fff2b0")); },
            veil: () => { for (let a = 0; a <= 56; a++) { const t = Math.PI * a / 56, x = 162 - 44 * Math.cos(t), y = 13 - 10.5 * Math.sin(t); put(x, y, "#dfeaf8"); put(x, y + 1, a % 2 ? "#d9b24e" : "#c8d8ee"); } },
        };
        if (["golgotha", "ascension", "tabor", "cross"].includes(P.motif)) motifs[P.motif]();
        // the skete on the far hill: a small chapel and a cell
        { const t = hf(38) - 1, sk = mix(P.church, far, .3), so = dk(far, .35);
            for (let y = t - 2; y <= t; y++) for (let x = 36; x <= 40; x++) put(x, y, x === 40 ? dk(sk, .15) : sk);
            put(38, t - 3, mix(P.dome, far, .2)); put(37, t - 3, so); put(39, t - 3, so); for (let y = t - 6; y <= t - 4; y++) put(38, y, mix(gold, far, .2)); put(37, t - 5, mix(gold, far, .3)); put(39, t - 5, mix(gold, far, .3));
            for (let x = 42; x <= 45; x++) { put(x, t, mix("#6a4a2c", far, .3)); put(x, t - 1, mix("#4a3a2c", far, .3)); }
            if (dark) put(38, t - 1, P.win); else put(38, t - 1, dk(sk, .3)); }

        // the forest along the far shore (firs in winter and the fasts, round crowns else), with the season's colour here and there
        const fir = nat === "winter" || P.trees === "fir", fc = tod({ spring: "#3f6a34", summer: "#2f5a2a", autumn: "#5a4a22", winter: "#1f3a30" }[nat]);
        const accent = tod({ spring: "#e8a8c0", autumn: "#d8902a" }[nat]);
        for (let x = 0; x < W; x++) {
            const k = x % 5, lot = Math.floor(x / 5) * 7 % 3, h = fir ? [0, 1, 3, 1, 0][k] + lot : [1, 2, 2, 2, 1][k] + (lot >> 1);
            for (let y = 21 - h; y < 22; y++) put(x, y, y === 21 - h ? (k < 2 ? lt(fc, .12) : fc) : k > 2 ? dk(fc, .2) : fc);
            if (accent && !sober && lot === 1 && k === 2) put(x, 20 - h + 2, accent);
            if (snowy && h && (k === 2 || k === 1)) put(x, 21 - h, snowC);
        }
        // a fir or a birch with an outline, a lit and a shaded side
        const tree = (tx, top, base, to, kind) => {
            if (kind === "fir") {
                const col = tod("#1f4a3a");
                for (let y = top; y < base - 1; y++) { const t = y - top, w = Math.floor(t * .36) - (t % 4 === 3 ? 1 : 0);
                    for (let x = tx - w; x <= tx + w; x++) put(x, y, w && (x === tx - w || x === tx + w) || t === 0 ? dk(col, .5) : x > tx ? dk(col, .22) : x === tx - w + 1 ? lt(col, .14) : col, to);
                    if (snowy && t % 4 === 0 && t) for (let x = tx - w + 1; x < tx; x++) put(x, y, snowC, to); }
                put(tx, base - 1, tod("#3b2a1e"), to); put(tx, base, tod("#3b2a1e"), to); return;
            }
            const col = tod(key === "pentecost" ? "#5aaa44" : { spring: "#8acb5a", summer: "#4a8a3a", autumn: "#e0b030", winter: "#6a7a6a" }[nat]), can = new Set(), r = (base - top) / 5;
            for (let y = base; y > top + 2; y--) { put(tx, y, "#eeeee6", to); if ((y * 7 + tx) % 4 === 0) put(tx, y, "#2a2a2a", to); }
            for (const [qx, qy, rr] of [[tx, top + r, r], [tx - r * .8, top + r * 2, r], [tx + r * .9, top + r * 2.2, r * .9], [tx, top + r * 2.9, r * .8]])
                for (let y = Math.floor(qy - rr); y <= qy + rr; y++) for (let x = Math.floor(qx - rr); x <= qx + rr; x++) if ((x - qx) ** 2 + (y - qy) ** 2 <= rr * rr) can.add(x + "," + y);
            for (const k of can) { const [x, y] = k.split(",").map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!can.has((x + dx) + "," + (y + dy))) put(x + dx, y + dy, dk(col, .55), to); }
            for (const k of can) { const [x, y] = k.split(",").map(Number); put(x, y, !can.has((x + 1) + "," + y) || !can.has(x + "," + (y + 1)) ? dk(col, .28) : !can.has((x - 1) + "," + y) || !can.has(x + "," + (y - 1)) ? lt(col, .22) : col, to); }
            for (let y = base; y > top + r * 3.2; y--) put(tx, y, (y * 7 + tx) % 4 === 0 ? "#2a2a2a" : tod("#eeeee6"), to);
        };
        for (const [tx, top] of [[142, 9], [204, 10], [211, 7]]) tree(tx, top, 21, g, "fir");

        // ---- the monastery on the far shore ----
        const ch = P.church, chO = dk(ch, .55), chS = dk(ch, .2), win = P.win, roof = P.roof, dome = P.dome;
        const onion = (cx, top, hws, col) => hws.forEach((hw, i) => { for (let x = cx - hw; x <= cx + hw; x++) put(x, top + i, hw && (x === cx - hw || x === cx + hw) || i === hws.length - 1 ? dk(col, .45) : x === cx - 1 && i && i < 3 ? lt(col, .4) : x > cx ? dk(col, .2) : col); });
        const cross = (cx, top, n) => { for (let y = top; y < top + n; y++) put(cx, y, gold); put(cx - 1, top + 1, gold); put(cx + 1, top + 1, gold); if (n > 3) { put(cx - 1, top + n - 1, gold); put(cx + 1, top + n - 2, gold); } };
        const wallRun = (x0, x1, y0) => { for (let x = x0; x <= x1; x++) { put(x, y0, dk(roof, .1)); if (snowy) put(x, y0, snowC); for (let y = y0 + 1; y <= 20; y++) put(x, y, y === y0 + 1 ? chS : ch); } };
        wallRun(138, 146, 17); wallRun(178, 189, 17); wallRun(197, 207, 18);
        for (let y = 18; y <= 20; y++) for (let x = 182; x <= 184; x++) put(x, y, y === 18 && x !== 183 ? chS : dk(P.door, .1)); // the holy gate
        // the brothers' cells: log houses with shingle roofs
        const cp = pal({ o: "#3a2e24", r: "#6a5a4a", R: "#8a7a64", w: "#8a6440", v: "#6a4a2c", d: "#2e1c10" });
        cp.n = dark ? win : tod("#2a2a36"); if (snowy) { cp.r = snowC; cp.R = snowC; }
        for (const x0 of [112, 125]) {
            draw(x0, 14, ["...ooooo...", "..oRRrrro..", ".oRRrrrrro.", "orrrrrrrrro", ".wwwwwwwww.", ".vvnvvvdvv.", ".wwwwwwdww."], cp);
            put(x0 + 7, 12, tod("#4a3a30")); put(x0 + 7, 13, tod("#4a3a30"));
            if (key === "pentecost" || key === "palm") { put(x0 + 6, 18, "#4a9a3c"); put(x0 + 6, 19, "#5aaa44"); } // green boughs by the door
        }
        // the church: five domes (three seen from here), round gables, arched windows
        const kx = 162;
        for (let y = 14; y <= 20; y++) for (let x = kx - 15; x <= kx + 15; x++) put(x, y, x === kx - 15 || x === kx + 15 ? chO : (x - kx) % 10 === 5 && Math.abs(x - kx) < 15 ? dk(ch, .1) : x > kx + 8 ? chS : ch);
        for (const ax of [kx - 10, kx, kx + 10]) for (let x = ax - 5; x <= ax + 5; x++) { const h = Math.round(Math.sqrt(Math.max(0, 25 - (x - ax) ** 2)) * .45);
            put(x, 13 - h, snowy ? snowC : x < ax ? lt(roof, .15) : roof); for (let y = 14 - h; y <= 13; y++) put(x, y, x > kx + 8 ? chS : ch); }
        for (const x of [kx - 12, kx - 8, kx + 8, kx + 12]) { put(x, 15, dk(ch, .3)); put(x, 16, win); put(x, 17, dk(win, .15)); }
        for (let y = 17; y <= 20; y++) for (let x = kx - 2; x <= kx + 2; x++) put(x, y, P.door); for (let x = kx - 1; x <= kx + 1; x++) put(x, 16, P.door);
        put(kx - 1, 14, gold); put(kx, 14, tod("#8a3a2a")); put(kx + 1, 14, gold); // the icon over the door
        for (const [cx, ct, ot, hws, dt] of [[kx - 10, 4, 7, [0, 1, 2, 1], 11], [kx + 10, 4, 7, [0, 1, 2, 1], 11], [kx, 2, 6, [0, 1, 2, 3, 2], 11]]) {
            for (let y = dt; y <= 12; y++) for (let x = cx - (hws.length > 4 ? 2 : 1); x <= cx + (hws.length > 4 ? 2 : 1); x++) put(x, y, x === cx && hws.length > 4 ? dk(win, .3) : x > cx ? chS : ch);
            onion(cx, ot, hws, dome); cross(cx, ct, ot - ct);
        }
        if (snowy) { put(kx - 1, 7, snowC); put(kx - 11, 8, snowC); put(kx + 9, 8, snowC); }
        // the bell tower: a tent roof over the belfry
        const bx = 193;
        cross(bx, 2, 3); onion(bx, 5, [0, 1, 2, 1], dome); for (let x = bx - 1; x <= bx + 1; x++) put(x, 9, x > bx ? chS : ch);
        for (let i = 0; i < 4; i++) for (let x = bx - 1 - i; x <= bx + 1 + i; x++) put(x, 10 + i, x === bx - 1 - i || x === bx + 1 + i ? dk(roof, .45) : snowy && x < bx ? snowC : x < bx ? lt(roof, .12) : dk(roof, .15));
        for (const cy of [14, 18]) for (let x = bx - 5; x <= bx + 5; x++) put(x, cy, dk(roof, .1));
        for (let y = 15; y <= 20; y++) if (y !== 18) for (let x = bx - 4; x <= bx + 4; x++) put(x, y, x === bx - 4 || x === bx + 4 ? chO : x > bx + 1 ? chS : ch);
        for (let y = 15; y <= 17; y++) for (let x = bx - 2; x <= bx + 2; x++) if (y > 15 || Math.abs(x - bx) < 2) put(x, y, tod("#1a1410"));
        const bell = tod("#d9a83a"); put(bx, 16, bell); for (let x = bx - 1; x <= bx + 1; x++) put(x, 17, bell);
        put(bx, 19, P.door); put(bx, 20, P.door);
        if (P.lamp) { put(kx, 15, "#c8322a"); if (animate) anim.push(blink(rect(kx, 15, "#ffb43a"), .8, "1;1;0.4")); } // a lampada before the icon in the fasts

        // the shore line, the field (left), the lake (right) with the monastery in it, the near bank
        const Lx = y => Math.round(104 - (y - 22) * 6.6), bankTop = x => x < 74 ? 29 : 30, ice = nat === "winter";
        for (let x = 0; x < W; x++) put(x, 21, P.top);
        for (let y = 22; y < 30; y++) for (let x = 0; x < Lx(y); x++) put(x, y, y % 2 ? P.ground : mix(P.ground, P.top, .5));
        const wat = ice ? (night ? "#4a5a7c" : tod("#a8bcd4")) : night ? "#16284c" : tod(mix(s1, "#1c3a64", .5));
        for (let y = 22; y < 30; y++) for (let x = Lx(y); x < W; x++) {
            const sy = 20 - (y - 22) * 2, sx = Math.min(W - 1, Math.max(0, x + (y % 2 ? ((x >> 2) & 1 ? 1 : -1) : 0)));
            let c = mix(g[sy * W + sx] || sky(sy), wat, ice ? .66 : .5);
            if (!ice && (x * 3 + y * 7) % 19 < 2) c = lt(c, .12);
            if (ice && (x + y * 9) % 37 === 0) c = lt(c, .3);
            put(x, y, c);
        }
        for (let y = 22; y < 30; y++) put(Lx(y), y, lt(wat, .2)); // the water's edge
        const bankC = tod({ spring: "#2f5a2a", summer: "#3a4a22", autumn: "#3a2818", winter: "#7a88a4" }[nat]);
        for (let x = 0; x < W; x++) { const b = bankTop(x); put(x, b, lt(bankC, .15), front); for (let y = b + 1; y < H; y++) put(x, y, y > 31 ? dk(bankC, .25) : bankC, front); }
        // reeds by the water
        const reed = tod(nat === "winter" ? "#8a7a5a" : nat === "autumn" ? "#9a7a3a" : "#4a7a34"), mace = tod("#5a3418");
        for (const [x0, n] of [[74, 6], [146, 5], [205, 7]]) for (let i = 0; i < n; i++) { const x = x0 + i * 2 - (i & 1), h = 3 + (x * 7) % 3, b = bankTop(x);
            for (let y = b - h; y < b; y++) put(x, y, reed, front); if (i % 2 === 0 && !sober) { put(x, b - h - 1, mace, front); put(x, b - h - 2, mace, front); } }
        // a little pier and a moored boat below the cells
        for (let x = 128; x <= 136; x++) put(x, 22, tod("#6a4a2c")); put(129, 23, tod("#3a2818")); put(135, 23, tod("#3a2818"));
        if (key !== "peterpaul" && !ice) for (let x = 120; x <= 126; x++) { put(x, 23, tod(x === 120 || x === 126 ? "#4a2e1a" : "#6a4428")); if (x > 120 && x < 126) put(x, 24, tod("#4a2e1a")); }

        // the season's field
        const fieldAt = (x, y) => y >= 22 && y < 30 && x < Lx(y);
        if (!sober && nat === "summer") for (const [x, y] of [[14, 23], [30, 24], [48, 23], [22, 26], [62, 25], [40, 27]]) if (fieldAt(x + 2, y + 3))
            draw(x, y, [".y.", "yYy", "yYy", "o.o"], pal({ y: "#f0d070", Y: "#c8a040", o: "#7a5a20" }));                       // sheaves of rye
        if (!sober && nat === "autumn") for (const [x, y] of [[16, 21], [44, 22], [28, 25]])
            draw(x, y, ["..p..", ".oho.", "ohhHo", "ohhHo", "oHHHo"], pal({ p: "#5a3a1a", o: "#4a3418", h: "#b89048", H: "#8a6a30" })); // haystacks
        if (!sober && nat === "spring" && key !== "pascha") for (let i = 0; i < 30; i++) { const x = Math.floor(rnd() * 100), y = 22 + Math.floor(rnd() * 8); if (fieldAt(x, y)) put(x, y, tod(i % 4 ? "#f4d23a" : "#ffffff")); }
        if (snowy) for (let i = 0; i < 14; i++) { const x = Math.floor(rnd() * 100), y = 22 + Math.floor(rnd() * 8); if (fieldAt(x + 2, y)) for (let d = 0; d < 2 + (i % 3); d++) put(x + d, y, tod("#b8c4d8")); }
        if (key === "pascha") for (const [x, y] of [[20, 24], [36, 26], [52, 23], [70, 25]]) { put(x, y, "#d8342c"); put(x + 1, y, "#b02a24"); put(x, y - 1, "#e8604a"); }
        if (key === "nativityTheotokos") for (let i = 0; i < 26; i++) { const x = Math.floor(rnd() * 96), y = 22 + Math.floor(rnd() * 8); if (fieldAt(x, y)) put(x, y, i % 3 ? "#4a6ad8" : "#ffffff"); }
        // the near trees on the left, in front of the field (a fir in winter and Lent, else a birch)
        tree(7, 3, 30, front, fir ? "fir" : "birch"); tree(19, 11, 29, front, fir ? "fir" : "birch");

        // the feasts' signs in the banner's own places
        const more = {
            dove: () => { // Theophany: the Jordan cut in the ice as a cross, an ice cross standing by it, the Spirit as a dove over the water
                const ix = 96; for (let y = 24; y <= 29; y++) put(ix, y, "#1c3a6a"); for (let x = ix - 3; x <= ix + 3; x++) put(x, 26, "#1c3a6a"); put(ix + 1, 25, "#3a6aa8");
                for (let y = 18; y <= 25; y++) { put(ix + 9, y, "#dceefa"); put(ix + 10, y, "#a8c8e8"); } for (let x = ix + 7; x <= ix + 12; x++) put(x, 20, "#dceefa");
                const rays = "#f6e3a1"; for (let y = 7; y <= 22; y += 3) { put(ix, y, rays); put(ix - (y - 6) * .3, y, rays); put(ix + (y - 6) * .3, y, rays); }
                const pts = rows => rows.flatMap((r, y) => [...r].map((ch, x) => ch === "#" ? [x, y] : null).filter(Boolean));
                const A = pts(["#.......#", ".#.....#.", "..##.##..", "...###...", "....#...."]), B = pts([".........", ".........", "####.####", "...###...", "....#...."]);
                const sp = q => q.map(([x, y]) => rect(ix - 4 + x, 1 + y, "#ffffff")).join("");
                if (animate) anim.push(blink(sp(A), .9, "1;0"), blink(sp(B), .9, "0;1")); else A.forEach(([x, y]) => put(ix - 4 + x, 1 + y, "#ffffff"));
            },
            candles: () => { for (let x = 84; x <= 196; x += 14) { const b = bankTop(x); put(x, b + 1, "#f4efe2", front); put(x, b, "#f4efe2", front);
                if (animate) over.push(blink(rect(x, b - 1, "#ffb43a"), +(.5 + (x % 7) * .08).toFixed(2), "1;1;0.55", x * .13)); else put(x, b - 1, "#ffb43a", front); } },
            lily: () => { for (let i = 0; i < 18; i++) put(100 + i * 3.4, i * .7, mix(sky(Math.round(i * .7)), "#f6e3a1", .7));
                for (const x of [90, 120]) { const b = bankTop(x); for (let y = b - 4; y < b; y++) put(x, y, "#3f8a3a", front); put(x - 1, b - 5, "#ffffff", front); put(x + 1, b - 5, "#ffffff", front); put(x, b - 6, "#ffffff", front); put(x, b - 5, "#f3d27a", front); } },
            fronds: () => { for (const x0 of [88, 132, 176]) { const b = bankTop(x0), tw = tod("#5a3a24");
                for (const [dx, h] of [[0, 6], [-2, 4], [2, 5], [-3, 3], [3, 3]]) for (let y = b - h; y < b; y++) { put(x0 + dx + (y < b - 3 ? Math.sign(dx) : 0), y, tw, front); if ((y + dx) % 2 === 0) put(x0 + dx + (y < b - 3 ? Math.sign(dx) : 0) + 1, y, "#e8e8e0", front); } } }, // pussy willow
            flames: () => { for (const x of [32, 46, 60]) tree(x, 12 + (x % 3), 28, front, "birch"); },
            tabor: () => { for (const x of [96, 150, 180]) draw(x, bankTop(x) + 1, [".rgr.", "orror", ".ooo."], pal({ r: "#d83a2a", g: "#8ac040", o: "#8a6a3a" }), front); }, // apples blessed at the Transfiguration
            dormition: () => { for (let a = 0; a < 24; a++) put(kx + 7.5 * Math.cos(a / 24 * Math.PI * 2), 8 + 5 * Math.sin(a / 24 * Math.PI * 2), "#d9b24e"); more.lilies(); },
            lilies: () => { for (const x of [86, 98, 118, 140, 168, 186]) { const b = bankTop(x); put(x, b - 1, "#3f8a3a", front); put(x, b - 2, "#ffffff", front); put(x - 1, b - 2, "#f4f0e4", front); } },
            steps: () => { for (let i = 0; i < 8; i++) { const x = 136 + i * 3, y = 20 - Math.floor(i / 2); put(x, y + 1, "#e8d8a8"); put(x, y, "#f4efe2");
                if (animate) over.push(blink(rect(x, y - 1, "#ffb43a"), .7, "1;0.5", i * .2)); else put(x, y - 1, "#ffb43a"); } },
            veil: motifs.veil,
            boat: () => {
                let o = ""; for (let x = 0; x <= 12; x++) o += rect(x, 5, "#6a4428"); for (let x = 1; x <= 11; x++) o += rect(x, 6, "#4a2e1a"); for (let y = 0; y < 5; y++) o += rect(6, y, "#3a2a1a");
                for (let y = 0; y < 4; y++) for (let x = 7; x <= 7 + y; x++) o += rect(x, y + 1, "#f4efe2"); o += rect(3, 3, "#14110f") + rect(3, 4, "#14110f") + rect(10, 4, "#6a1414");
                for (let x = -6; x < 0; x += 2) o += rect(x, 6 + (x & 1), "#c8ccd4"); // the net in the water
                anim.push(animate ? move(o, [[118, 19], [118, 19], [118, 20], [118, 20]], 2.4) : `<g transform='translate(118 19)'>${o}</g>`);
            },
        };
        if (P.motif && more[P.motif]) more[P.motif]();

        // creatures of this place: ducks on the lake, a heron in the reeds, cranes going south, a roe deer at the forest edge, an elk on the ice, an owl at night, the bear at the cells
        const act = (frames, steps, begin, list = anim) => {
            const T = steps.reduce((a, st) => a + st[3], 0); let t = 0;
            const kt = steps.map(st => { const k = Math.round(t / T * 1e6) / 1e6; t += st[3]; return k; }).join(";");
            const tail = `dur='${+T.toFixed(2)}s' begin='${(-begin).toFixed(2)}s' keyTimes='${kt}' calcMode='discrete' repeatCount='indefinite'`;
            list.push(`<g>${frames.map((f, k) => `<g opacity='${+(steps[0][2] === k)}'>${f}<animate attributeName='opacity' values='${steps.map(st => +(st[2] === k)).join(";")}' ${tail}/></g>`).join("")}<animateTransform attributeName='transform' type='translate' values='${steps.map(st => st[0] + " " + st[1]).join(";")}' ${tail}/></g>`);
        };
        const away = [-30, 0, -1], bearDay = Math.imul(Math.floor((opt.clock || 0) / 86400) + 7, 2654435761) >>> 28 < 3, creatures = [];
        if (!calm) {
            if (nat === "winter") {
                if (phase === "day" || phase === "dawn") { // an elk crosses the ice, stops, goes on into the forest
                    const ep = pal({ a: "#c8b090", b: "#4a3424", B: "#6a4c34", d: "#2e2018", k: "#120a06" }), A = ["a.a.a.....", ".aaa......", "kBbb..bbb.", "..bbbbbbbb", "...bbbbbbb", "...d.d..d.", "...d..d.d."];
                    const B = ["a.a.a.....", ".aaa......", "kBbb..bbb.", "..bbbbbbbb", "...bbbbbbb", "...d.d..d.", "..d.d..d.."], St = [[...away, 80]];
                    for (let x = 206; x >= 40; x -= 2) { St.push([x, 20, (x >> 1) & 1, .5]); if (x === 150) St.push([x, 20, 0, 4]); }
                    creatures.push(() => act([spr(A, ep), spr(B, ep)], St, ((opt.clock || 0) + 23) % St.reduce((a, q) => a + q[3], 0)));
                } else creatures.push("owl");
            } else if (night) creatures.push("owl");
            else if (phase === "dusk") creatures.push("deer");
            else if (phase === "dawn") { creatures.push(nat === "autumn" ? "deer" : "heron"); if (bearDay) creatures.push("bear"); }
            else creatures.push(nat === "autumn" ? "cranes" : "ducks");
        }
        if (P.motif) creatures.splice(1);
        const clockOf = (St, off) => ((opt.clock || 0) + off) % St.reduce((a, q) => a + q[3], 0);
        for (const c of animate ? creatures : []) {
            if (typeof c === "function") { c(); continue; }
            if (c === "owl") { // on the near tree, blinking
                const op = pal({ o: "#6a5038", l: "#9a7a58", e: "#f0c840", k: "#1a1008" }), A = ["o.o", "eke", "lol", ".o."], B = ["o.o", "oko", "lol", ".o."];
                act([spr(A, op), spr(B, op)], [[fir ? 9 : 10, fir ? 16 : 14, 0, 5], [fir ? 9 : 10, fir ? 16 : 14, 1, .25], [fir ? 9 : 10, fir ? 16 : 14, 0, 7], [fir ? 9 : 10, fir ? 16 : 14, 1, .25], [...away, 40]], clockOf([[0, 0, 0, 52.5]], 3), over);
            } else if (c === "ducks") { // a drake and a duck swim across under the monastery
                const dp = pal({ g: "#2a6a3a", y: "#e8c040", b: "#7a4a2a", s: "#c8c4bc", t: "#2a2420", h: "#8a6a4a", l: "#e0eef8" });
                const A = [".gg.......hh....", "ygbsst...yhhhhh.", "..sss.l.l..hhh.l"], B = [".gg.......hh....", "ygbsst...yhhhhh.", "..sss..l....hhh."], St = [[...away, 50]];
                for (let x = 210; x >= 96; x -= 2) St.push([x, 25, (x >> 1) & 1, 1.1]);
                act([spr(A, dp), spr(B, dp)], St, clockOf(St, 9));
            } else if (c === "heron") { // a grey heron stands in the shallows, strikes once, stands again
                const hp = pal({ k: "#2a2a30", y: "#e0b040", w: "#e8e8e4", g: "#8a929c", G: "#6a727c" });
                const A = ["..kk.", "yyww.", "...w.", "...w.", "..ggg", ".gGGg", "...k.", "...k."], B = [".....", ".....", ".....", ".....", ".wggg", "ywGGg", "...k.", "...k."];
                const at = [96, 21]; // in the open shallows, clear of the reeds
                act([spr(A, hp), spr(B, hp)], [[...away, 30], [...at, 0, 9], [...at, 1, .5], [...at, 0, 7], [...at, 1, .4], [...at, 0, 8]], clockOf([[0, 0, 0, 54.9]], 13));
            } else if (c === "cranes") { // a wedge of cranes going south
                const bc = tod("#3a3438"), up = [[0, 0], [2, 0], [1, 1]], dn = [[1, 0], [0, 1], [2, 1]], at = [[0, 4], [4, 2], [8, 0], [4, 6], [8, 8], [12, 10]];
                const f = q => at.map(([ax, ay]) => q.map(([x, y]) => rect(ax + x, ay + y, bc)).join("")).join(""), St = [[...away, 45]];
                for (let x = 220; x >= -18; x -= 2) St.push([x, 2 + Math.round(Math.sin(x / 30)), (x >> 1) & 1, .3]);
                act([f(up), f(dn)], St, clockOf(St, 7));
            } else if (c === "deer") { // a roe deer steps out of the forest edge, grazes, goes back
                const dp = pal({ b: "#9a6a3a", w: "#f0e8d8", d: "#4a3020", k: "#1a1008", e: "#7a5230" });
                const A = [".....e.", "....bbk", "wbbbbb.", ".bbbb..", ".d..d.."], B = [".....e.", "....bbk", "wbbbbb.", ".bbbb..", "d....d."], G = [".......", "wbbbb..", ".bbbbbe", ".b..bbk", ".d..d.."], St = [[...away, 60]];
                for (let x = -8; x <= 36; x++) St.push([x, 19, x & 1, .5]);
                St.push([36, 19, 2, 6], [36, 19, 0, 1.5], [36, 19, 2, 5]); // out in the open field, past the near birches
                for (let x = 36; x >= -8; x--) St.push([x, 19, 3 + (x & 1), .45]);
                act([spr(A, dp), spr(B, dp), spr(G, dp), spr(flip(A), dp), spr(flip(B), dp)], St, clockOf(St, 19));
            } else if (c === "bear") { // St Sergius's bear comes to the cell door for its bread, waits, and goes back to the forest
                const bb = pal({ l: "#7a5232", b: "#5a3a22", d: "#2e1c10", s: "#a07a52", e: "#100806" }), St = [[...away, 900]];
                const A = ["..lll..l.", ".lbbblbbe", "bbbbbbbbs", "bbbbbbbb.", ".d.d..d.d"], B = ["..lll..l.", ".lbbblbbe", "bbbbbbbbs", "bbbbbbbb.", "d.d..d.d."], S = ["..lll....", ".lbbbl.l.", "bbbbbbbbe", "bbbbbbbbs", ".d.d..d.d"];
                for (let x = 84; x <= 102; x++) St.push([x, 16, x & 1, .45]);
                St.push([102, 16, 2, 8], [102, 16, 0, 3], [102, 16, 2, 6]); // by the corner of the first cell, against the forest, not the logs
                for (let x = 102; x >= 84; x--) St.push([x, 16, 3 + (x & 1), .45]);
                act([spr(A, bb), spr(B, bb), spr(S, bb), spr(flip(A), bb), spr(flip(B), bb)], St, clockOf(St, 400));
            }
        }

        // ---- moving things ----
        if (animate) {
            if (dark) anim.push(blink([kx - 12, kx + 8].map(x => rect(x, 16, dk(win, .3))).join(""), 3.4, "0;0;1;0;0;0;1", 1.1)); // candlelight in the church windows
            anim.push(blink(rect(kx + 1, 3, "#ffffff"), 9, "0;0;0;0;0;0;0;0;1", 3));                                             // the cross catches the light
            // smoke from the cells' chimneys in the cold or after the day
            if (nat === "winter" || nat === "autumn" || phase !== "day") for (const x of [119, 132]) for (let k = 0; k < 2; k++)
                anim.push(move(rect(x, 11, mix(P.sky[1], "#b8b8c0", .6)), [[0, 0], [0, -1], [1, -2], [1, -3], [2, -4], [3, -5], [4, -6], [-300, 0], [-300, 0]], 4.5, k * 2.2 + x * .1));
            // sun or moon glitter on open water
            if (!ice && (P.sun || P.moon) && !P.rain) for (let y = 25; y < 30; y++) anim.push(blink(rect(SX - 1 + (y % 3), y, lt(wat, .55)) + rect(SX + 1 - (y % 2), y, lt(wat, .4)), +(1 + (y % 3) * .35).toFixed(2), "1;0;0.5", y * .3));
            for (let i = 0; i < Math.min(P.parts || 0, 26) && P.part; i++) {
                const x0 = Math.floor(rnd() * W), c = P.part2 && i % 3 === 0 ? P.part2 : P.part;
                if (P.fall === "sparkle") { anim.push(blink(rect(x0, 1 + Math.floor(rnd() * 16), c), +(1.5 + rnd() * 2).toFixed(2), "0;1;0;0", rnd() * 3)); continue; }
                const pts = [], dx = P.fall === "petal" ? 1 : P.fall === "leaf" ? .5 : 0;
                for (let y = -1; y <= 33; y += 2) pts.push([Math.round(dx * (y + 1) + (P.fall === "snow" && y % 8 === 3 ? 1 : 0)), y]);
                const dur = +(pts.length * (P.fall === "snow" ? .8 : .55)).toFixed(2), farFlake = P.fall === "snow" && i % 2;
                anim.push(move(rect(x0, 0, farFlake ? mix(c, s0, .45) : c), pts, farFlake ? +(dur * 1.5).toFixed(2) : dur, rnd() * dur));
            }
            for (let i = 0; i < (P.fireflies || 0); i++) {
                const x0 = 8 + Math.floor(rnd() * 90), y0 = 20 + Math.floor(rnd() * 7), pts = [];
                for (let k = 0; k < 12; k++) pts.push([Math.round(2 * Math.sin(k / 2 + i)), Math.round(Math.cos(k / 3 + i))]);
                anim.push(blink(move(rect(x0, y0, "#e8f070"), pts, 7.2, rnd() * 7), +(1.1 + rnd()).toFixed(2), "1;0.2;1", rnd() * 2));
            }
            for (let i = 0; i < Math.min(P.clouds || 0, 3); i++) {
                const y0 = 2 + i * 4, cl = mix(P.sky[0], "#ffffff", phase === "day" ? .85 : .55), cs = mix(P.sky[0], "#ffffff", phase === "day" ? .65 : .35);
                let o = ""; for (let x = 2; x <= 7; x++) o += rect(x, y0, cl); for (let x = 0; x <= 10; x++) o += rect(x, y0 + 1, x === 0 || x === 10 ? cs : cl);
                const pts = []; for (let x = -12; x <= W; x += 2) pts.push([x, 0]);
                const dur = +(pts.length * 3.2).toFixed(1); anim.push(move(o, pts, dur, rnd() * dur));
            }
            const monk = (robe, hood, lamp) => rect(1, 0, hood) + rect(0, 1, hood) + rect(1, 1, robe) + rect(2, 1, robe) + rect(0, 2, robe) + rect(1, 2, robe) + rect(2, 2, robe) + rect(0, 3, robe) + rect(1, 3, robe) + rect(2, 3, robe)
                + blink(rect(0, 4, robe) + rect(2, 4, robe), .52, "1;0") + blink(rect(1, 4, robe), .52, "0;1") + (lamp ? blink(rect(3, 2, "#ffc04a"), .7, "1;1;0.55") + rect(3, 3, "#f4efe2") : "");
            if (key === "pascha") { // the procession goes round the church with candles, led in red
                const path = []; for (let x = 146; x <= 176; x++) path.push([x, 16]); for (let x = 176; x >= 146; x--) path.push([x, 16]);
                for (let k = 0; k < 3; k++) anim.push(move(monk(k === 0 ? "#6a1414" : "#14110f", k === 0 ? "#d9b24e" : "#3c342c", true), path, +(path.length * .3).toFixed(1), k * 1.5));
            } else if (key !== "holyweek" || !night) { // a brother walks from his cell to church now and then
                const walk = []; for (let x = 122; x <= 158; x++) walk.push([x, 16]);
                const pts = [...walk, ...Array(120).fill([-40, 0])];
                anim.push(move(monk(night ? "#060506" : "#14110f", night ? "#1c1814" : "#3c342c", dark), pts, +(pts.length * .28).toFixed(2), (key.length * 11) % 40));
            }
            if (opt.bells) { // the bell swings and its sound goes out over the water
                anim.push(blink(rect(bx - 1, 16, bell) + rect(bx, 17, tod("#1a1410")), .8, "1;0"), blink(rect(bx + 1, 16, bell) + rect(bx, 17, tod("#1a1410")), .8, "0;1"));
                for (let k = 0; k < 4; k++) { const side = k % 2 ? 1 : -1, pts = []; for (let i = 0; i < 6; i++) pts.push([side * (5 + i * 2), -i]);
                    pts.push([-300, 0], [-300, 0], [-300, 0]); anim.push(move(rect(bx, 15, "#fff2b0"), pts, 3.6, k * .9)); }
            }
            if (P.rain) {
                for (let i = 0; i < 30; i++) { const x0 = Math.floor(rnd() * (W + 10)) - 4, pts = []; for (let y = -2; y <= 32; y += 3) pts.push([Math.round((y + 2) / 5), y]);
                    anim.push(move(rect(x0, 0, i % 2 ? "#aebcd8" : "#8c9cbc") + rect(x0, 1, "#6a7c9c"), pts, +(pts.length * (i % 2 ? .06 : .09)).toFixed(3), rnd())); }
                for (let i = 0; i < 8; i++) { const y = 23 + (i * 3) % 7, x = Lx(y) + 6 + Math.floor(rnd() * (W - Lx(y) - 12)); anim.push(blink(rect(x - 1, y, lt(wat, .3)) + rect(x + 1, y, lt(wat, .3)), +(.9 + rnd()).toFixed(2), "0;1;0;0", rnd() * 2)); }
            }
            const bc = P.birdC || (key === "annunciation" ? "#ffffff" : phase === "day" ? "#2a2420" : "#1a1218");
            for (let i = 0; i < (P.birds || 0); i++) {
                const y0 = 3 + Math.floor(rnd() * 8), up = [[0, 0], [2, 0], [1, 1]], down = [[1, 0], [0, 1], [2, 1]];
                const fr = (pts, v) => blink(pts.map(([x, y]) => rect(x, y0 + y, bc)).join(""), .36, v), path = [];
                for (let x = -4; x <= W + 2; x += 2) path.push([x, Math.round(1.5 * Math.sin(x / 9 + i * 2))]);
                const dur = +(path.length * .3).toFixed(2); anim.push(move(fr(up, "1;0") + fr(down, "0;1"), path, dur, i * dur / Math.max(1, P.birds) + rnd() * 3));
            }
        }

        const merged = grid => { const runs = {}; for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const c = grid[y * W + x]; let n = 1; while (x + n < W && grid[y * W + x + n] === c) n++; if (c) (runs[c] ||= []).push(`M${x} ${y}h${n}v1h-${n}z`); x += n; } }
            return Object.entries(runs).map(([c, d]) => `<path fill='${c}' d='${d.join("")}'/>`).join(""); };
        return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='xMidYMid slice' shape-rendering='crispEdges'>${merged(g)}${anim.join("")}${merged(front)}${over.join("")}</svg>`;
    }
    static bannerUrl(key, opt) { return `url("data:image/svg+xml,${encodeURIComponent(SeasonArt.banner(key, opt))}")`; }

    current() { return this.settings.season && this.settings.season !== "auto" ? this.settings.season : SeasonArt.seasonOf(); }
    phase() { return this.settings.daylight ? SeasonArt.phaseOf() : "day"; }
    apply() {
        BdApi.DOM.removeStyle(this.name);
        if (!this.settings.on) { this.shown = this.current() + "/" + this.phase() + "/" + new Date().toDateString(); delete globalThis.__cl3arScene; dispatchEvent(new CustomEvent("cl3ar:scene")); return; }
        const key = this.current(), phase = this.phase();
        this.shown = key + "/" + phase + "/" + new Date().toDateString();
        const weather = this.settings.weather ? SeasonArt.weatherOf(new Date(), key) : null;
        const bells = SeasonArt.bellsOf(new Date(), key, phase);
        const moving = !!this.settings.animate && !(this.settings.pauseAway && this.away);
        this.shownMoving = moving;
        const opts = { phase, weather, bells, animate: moving, clock: Math.round(Date.now() / 1000) }; // the creatures keep the wall clock's time
        const url = SeasonArt.url(key, opts); let banner;
        // the Home banner (url) is a picture of its own for the same moment, drawn only when Home asks for it; panelUrl is the bar's scene
        globalThis.__cl3arScene = { key, phase, weather, label: LABEL[key] || key, panelUrl: url, get url() { return banner ||= SeasonArt.bannerUrl(key, opts); } };
        dispatchEvent(new CustomEvent("cl3ar:scene"));
        BdApi.DOM.addStyle(this.name, `
div[class*="sidebar_"] > section[class*="panels_"]{background:linear-gradient(90deg,rgba(8,8,8,.55),rgba(8,8,8,.22) 55%,rgba(8,8,8,.08)),${url} center / cover no-repeat!important;
  image-rendering:pixelated}`);
    }
    /* in the background (another window focused, or minimised) the scene holds still: no work while you game */
    static isAway(doc = document) { return !!doc.hidden || (typeof doc.hasFocus === "function" && !doc.hasFocus()); }
    start() {
        this.load(); this.away = SeasonArt.isAway(); this.apply();
        this.onAway = () => { clearTimeout(this.awayT); this.awayT = setTimeout(() => { const a = SeasonArt.isAway(); if (a !== this.away) { this.away = a; if (this.settings.animate && this.settings.pauseAway) this.apply(); } }, 400); };
        for (const ev of ["blur", "focus"]) addEventListener(ev, this.onAway);
        document.addEventListener("visibilitychange", this.onAway);
        this.onSettings = () => { if (this.current() + "/" + this.phase() + "/" + new Date().toDateString() !== this.shown) this.apply(); }; // e.g. Old/New Calendar changed on Home
        addEventListener("cl3ar:settings", this.onSettings);
        this.timer = setInterval(() => { if (this.current() + "/" + this.phase() + "/" + new Date().toDateString() !== this.shown) this.apply(); }, 5 * 60 * 1000); // turns with the day and the Church year
    }
    stop() { clearInterval(this.timer); clearTimeout(this.awayT); for (const ev of ["blur", "focus"]) removeEventListener(ev, this.onAway); document.removeEventListener("visibilitychange", this.onAway); removeEventListener("cl3ar:settings", this.onSettings); BdApi.DOM.removeStyle(this.name); delete globalThis.__cl3arScene; dispatchEvent(new CustomEvent("cl3ar:scene")); }
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "switch", id: "on", name: "Living pixel scene behind the bottom bar", value: this.settings.on },
                { type: "switch", id: "animate", name: "Let it move (birds, snow, candlelight)", note: "Small, slow pixel steps; turn off to keep it still.", value: this.settings.animate },
                { type: "switch", id: "pauseAway", name: "Hold still while Discord is in the background", note: "Nothing moves (and nothing is drawn) while you use another window or play a game.", value: this.settings.pauseAway },
                { type: "switch", id: "weather", name: "Weather (some days it rains in spring, summer and autumn)", value: this.settings.weather },
                { type: "switch", id: "daylight", name: "Follow the time of day (dawn, dusk, night with stars)", value: this.settings.daylight },
                { type: "dropdown", id: "season", name: "Scene", value: this.settings.season,
                  options: [{ label: "Automatic (the Church's feasts and fasts, Old or New Calendar as chosen on Home; else the time of year)", value: "auto" }, ...Object.entries(LABEL).map(([value, label]) => ({ label, value }))] },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.apply(); },
        });
    }
};
module.exports.LABEL = LABEL;
