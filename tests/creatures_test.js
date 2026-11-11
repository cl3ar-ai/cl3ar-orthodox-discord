// St Sergius: gates for the scene foreground and its creatures.  node tests/art-sergius/creatures_test.js
const assert = require("assert"), path = require("path");
global.BdApi = { Data: { load: () => null, save() {} } };
const S = require(path.join(__dirname, "..", "src", "seasonart.js"));
const tracks = svg => (svg.match(/animateTransform[^>]*keyTimes/g) || []).length;
let n = 0;
for (const k of Object.keys(S.LABEL)) for (const phase of ["dawn", "day", "dusk", "night"]) for (const weather of [null, "rain"]) for (const clock of [0, 1728000742, 1762845000]) {
    const svg = S.scene(k, { phase, weather, bells: true, clock }), c = tracks(svg);
    assert.ok(c <= 2, `${k}/${phase}/${weather}: at most two creatures, got ${c}`);
    if (["lent", "holyweek", "nativity", "theophany", "dormition", "entry"].includes(k) || weather) assert.strictEqual(c, 0, `${k}/${phase}/${weather}: kept quiet`);
    assert.ok(svg.length < 60000, `${k}/${phase} size ${svg.length}`);
    for (const m of svg.matchAll(/values='([^']+)'[^>]*keyTimes='([^']+)'/g)) {
        const v = m[1].split(";"), kt = m[2].split(";").map(Number);
        assert.strictEqual(v.length, kt.length, `${k}/${phase}: values and keyTimes counts match`);
        assert.strictEqual(kt[0], 0, `${k}/${phase}: keyTimes start at 0`);
        for (let i = 1; i < kt.length; i++) assert.ok(kt[i] > kt[i - 1] && kt[i] < 1, `${k}/${phase}: keyTimes strictly increase`);
    }
    assert.ok(!tracks(S.scene(k, { phase, weather, clock, animate: false })), `${k}/${phase}: the still scene has no creatures moving`);
    n++;
}
// the bear comes on only some dawns (about one in five)
let bear = 0; for (let d = 20000; d < 20365; d++) if (tracks(S.scene("spring", { phase: "dawn", clock: d * 86400 })) === 2) bear++;
assert.ok(bear > 30 && bear < 110, "bear dawns per year: " + bear);
// the fence is there in an ordinary season and gone on the river feasts
assert.ok(S.scene("autumn", { phase: "day" }).includes("#b8915e") && !S.scene("theophany", { phase: "day" }).includes("#b8915e"), "fence where it belongs");
console.log(`Creatures: all checks passed (${n} scenes, bear on ${bear} of 365 dawns)`);
