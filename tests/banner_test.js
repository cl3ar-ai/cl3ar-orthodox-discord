// St Sergius: gates for the Home banner (its own picture, not the bar's).  node tests/art-sergius/banner_test.js
const assert = require("assert"), path = require("path");
global.BdApi = { Data: { load: () => null, save() {} }, DOM: { addStyle() {}, removeStyle() {} } };
global.dispatchEvent = () => {}; global.CustomEvent = class { constructor(t) { this.type = t; } };
const S = require(path.join(__dirname, "..", "src", "seasonart.js"));
const tracks = svg => (svg.match(/animateTransform[^>]*keyTimes/g) || []).length;
const quiet = ["lent", "holyweek", "nativity", "theophany", "dormition", "entry"];
let n = 0, big = 0;
for (const k of Object.keys(S.LABEL)) for (const phase of ["dawn", "day", "dusk", "night"]) for (const weather of [null, "rain"]) for (const clock of [0, 1728000742, 1762845000]) {
    const svg = S.banner(k, { phase, weather, bells: true, clock }), c = tracks(svg), at = `${k}/${phase}/${weather}/${clock}`;
    assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>") && svg.includes("viewBox='0 0 216 34'"), at + ": a 216x34 svg");
    assert.ok(!/NaN|undefined/.test(svg), at + ": no NaN/undefined");
    assert.ok(svg.length < 60000, `${at}: size ${svg.length}`); big = Math.max(big, svg.length);
    assert.ok(svg.includes("<animate"), at + ": it moves");
    assert.ok(c <= 2, `${at}: at most two creatures, got ${c}`);
    if (quiet.includes(k) || weather) assert.strictEqual(c, 0, at + ": kept quiet");
    for (const m of svg.matchAll(/values='([^']+)'[^>]*keyTimes='([^']+)'/g)) {
        const v = m[1].split(";"), kt = m[2].split(";").map(Number);
        assert.strictEqual(v.length, kt.length, at + ": values and keyTimes counts match");
        assert.strictEqual(kt[0], 0, at + ": keyTimes start at 0");
        for (let i = 1; i < kt.length; i++) assert.ok(kt[i] > kt[i - 1] && kt[i] < 1, at + ": keyTimes strictly increase");
    }
    assert.ok(!S.banner(k, { phase, weather, clock, animate: false }).includes("<animate"), at + ": the still banner holds still");
    n++;
}
// every feast and fast has its own banner, not just its season's
const base = { winter: ["nativity", "theophany", "meeting", "lent", "holyweek", "entry", "nativityfast"], spring: ["annunciation", "palm", "pascha"],
    summer: ["ascension", "pentecost", "transfiguration", "dormition", "nativityTheotokos", "peterpaul", "apostlesfast", "dormitionfast"], autumn: ["exaltation", "protection"] };
for (const [b, ks] of Object.entries(base)) for (const k of ks) assert.notStrictEqual(S.banner(k, { phase: "day", animate: false }), S.banner(b, { phase: "day", animate: false }), k + " differs from plain " + b);
// creatures do come in ordinary times
assert.ok(tracks(S.banner("summer", { phase: "day" })) >= 1 && tracks(S.banner("autumn", { phase: "day" })) >= 1 && tracks(S.banner("winter", { phase: "day" })) >= 1, "ducks, cranes, elk");
// apply(): Home's banner (url) is the banner picture, the bar keeps its own scene (panelUrl)
const inst = new S({ name: "t" }); inst.load(); inst.apply();
const sc = globalThis.__cl3arScene;
assert.ok(sc.url.includes(encodeURIComponent("viewBox='0 0 216 34'")), "Home gets the banner");
assert.ok(sc.panelUrl.includes(encodeURIComponent("viewBox='0 0 108 17'")), "the bar keeps its scene");
assert.notStrictEqual(sc.url, sc.panelUrl, "two different pictures");
console.log(`Banner: all checks passed (${n} banners, largest ${big} bytes)`);
