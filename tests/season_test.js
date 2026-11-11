const assert = require("assert"), path = require("path");
global.BdApi = { Data: { load: () => null, save() {} } };
const S = require(path.join(__dirname, "..", "src", "seasonart.js"));
const at = (y, m, d) => S.seasonOf(new Date(y, m - 1, d));
const eq = (got, want, msg) => assert.strictEqual(got, want, `${msg}: got ${got}`);
// natural seasons
eq(at(2026, 11, 11), "autumn", "today, 2026-11-11");
eq(at(2026, 12, 20), "nativityfast", "inside the Nativity Fast (Nov 28 - Jan 6)");
eq(at(2026, 11, 27), "autumn", "day before the Nativity Fast");
eq(at(2026, 11, 28), "nativityfast", "first day of the Nativity Fast");
eq(at(2027, 7, 20), "summer", "summer, no fast");
eq(at(2026, 10, 6), "autumn", "autumn, after the Exaltation afterfeast");
// Great Feasts on their own day (independently worked out: Julian date + 13)
eq(at(2026, 1, 7), "nativity", "Nativity O.S.");
eq(at(2026, 1, 15), "nativity", "Christmastide to Theophany eve");
eq(at(2026, 1, 19), "theophany", "Theophany");
eq(at(2026, 1, 27), "theophany", "Theophany leave-taking");
eq(at(2026, 1, 28), "winter", "after Theophany");
eq(at(2026, 2, 15), "meeting", "Meeting of the Lord");
eq(at(2026, 4, 7), "annunciation", "Annunciation wins over Holy Week");
eq(at(2026, 4, 8), "holyweek", "Annunciation afterfeast gives way to Holy Week (2026: Annunciation is Holy Tuesday)");
eq(at(2026, 4, 12), "pascha", "Pascha 2026");
eq(at(2026, 4, 5), "palm", "Palm Sunday 2026");
eq(at(2026, 4, 9), "holyweek", "Holy Thursday 2026");
eq(at(2026, 5, 21), "ascension", "Ascension 2026 (P+39)");
eq(at(2026, 5, 31), "pentecost", "Pentecost 2026 (P+49)");
eq(at(2026, 6, 15), "apostlesfast", "Apostles' Fast 2026");
eq(at(2026, 7, 12), "peterpaul", "Ss Peter and Paul");
eq(at(2026, 8, 14), "dormitionfast", "Dormition Fast");
eq(at(2026, 8, 19), "transfiguration", "Transfiguration (inside the Dormition Fast)");
eq(at(2026, 8, 28), "dormition", "Dormition");
eq(at(2026, 9, 21), "nativityTheotokos", "Nativity of the Theotokos");
eq(at(2026, 9, 27), "exaltation", "Exaltation of the Cross");
eq(at(2026, 10, 14), "protection", "Protection of the Theotokos");
eq(at(2026, 12, 4), "entry", "Entry of the Theotokos (inside the Nativity Fast)");
eq(at(2027, 3, 15), "lent", "Clean Monday 2027");
eq(at(2027, 5, 1), "holyweek", "Holy Saturday 2027");
eq(at(2027, 5, 2), "pascha", "Pascha 2027");
// the scene's calendar agrees with the Home page's feast list (2025-2027)
global.DOMParser = class {}; const Home = require(path.join(__dirname, "..", "src", "home.js"));
const h = new Home({ name: "t" }), names = { theophany: "Theophany", meeting: "Meeting of the Lord", annunciation: "Annunciation", peterpaul: "Holy Apostles Peter and Paul",
    transfiguration: "Transfiguration", dormition: "Dormition of the Theotokos", nativityTheotokos: "Nativity of the Theotokos", exaltation: "Exaltation of the Holy Cross",
    protection: "Protection of the Theotokos", entry: "Entry of the Theotokos", nativity: "Nativity of Christ", palm: "Entry into Jerusalem (Palm Sunday)", ascension: "Ascension", pentecost: "Pentecost" };
let checked = 0;
for (const y of [2025, 2026, 2027]) {
    const ev = [];
    for (let m = 0; m < 12; m++) for (let d = 1; d <= 28; d += 9) for (const e of h.feasts(new Date(y, m, d)).upcoming) ev.push(e);
    for (const [k, d] of S.calendar(y).feasts) {
        if (d.getFullYear() !== y) continue;
        const hit = ev.find(e => e.name === names[k] && e.date.getTime() === d.getTime());
        assert.ok(hit, `${k} ${d.toDateString()} matches the Home calendar`); checked++;
    }
}
assert.ok(checked >= 36, "checked " + checked);
// every scene, every time of day: a valid, small SVG with moving parts
for (const k of Object.keys(S.LABEL)) for (const phase of ["dawn", "day", "dusk", "night"]) {
    const svg = S.scene(k, { phase });
    assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>") && svg.includes("<path"), k + phase);
    assert.ok(svg.length < 60000, `${k}/${phase} too big: ${svg.length}`);
    assert.ok(svg.includes("<animate"), `${k}/${phase} moves`);
    assert.ok(!/NaN|undefined/.test(svg), `${k}/${phase} has no NaN/undefined`);
    const still = S.scene(k, { phase, animate: false });
    assert.ok(!still.includes("<animate"), `${k}/${phase} still version`);
}
eq(S.phaseOf(new Date(2026, 0, 1, 2)), "night", "2 am"); eq(S.phaseOf(new Date(2026, 0, 1, 6)), "dawn", "6 am");
eq(S.phaseOf(new Date(2026, 0, 1, 12)), "day", "noon"); eq(S.phaseOf(new Date(2026, 0, 1, 19)), "dusk", "7 pm");
// weather: deterministic per day, varied over a season, never on feasts or in winter
{
    const days = []; for (let d = 1; d <= 30; d++) days.push(S.weatherOf(new Date(2026, 9, 6 + d), "autumn"));
    const rainy = days.filter(Boolean).length;
    assert.ok(rainy >= 3 && rainy <= 20, "autumn has some rainy days: " + rainy);
    assert.strictEqual(S.weatherOf(new Date(2026, 9, 10, 1), "autumn"), S.weatherOf(new Date(2026, 9, 10, 23), "autumn"), "same weather all day");
    assert.strictEqual(S.weatherOf(new Date(2026, 0, 19), "theophany"), null, "never on a feast");
    assert.strictEqual(S.weatherOf(new Date(2026, 0, 30), "winter"), null, "winter keeps its snow");
    const wet = S.scene("autumn", { phase: "day", weather: "rain" });
    assert.ok(wet.length < 60000 && wet.includes("#6a7c9c"), "rain drawn");
}
// bells: Sundays and feasts, mornings and days only
eq(S.bellsOf(new Date(2026, 10, 15, 10), "autumn", "day"), true, "Sunday morning");
eq(S.bellsOf(new Date(2026, 10, 11, 10), "autumn", "day"), false, "an ordinary Wednesday");
eq(S.bellsOf(new Date(2026, 8, 27, 10), "exaltation", "day"), true, "a feast day");
eq(S.bellsOf(new Date(2026, 10, 15, 22), "autumn", "night"), false, "not at night");
eq(S.bellsOf(new Date(2026, 2, 4, 10), "lent", "day"), false, "a Lenten weekday");
assert.ok(S.scene("autumn", { bells: true }).includes("#fff2b0"), "chimes drawn");
assert.ok((S.scene("pascha").match(/#6a1414/g) || []).length >= 1, "Paschal procession led in red");
// away: hidden or unfocused documents count as away
assert.strictEqual(S.isAway({ hidden: true, hasFocus: () => true }), true); assert.strictEqual(S.isAway({ hidden: false, hasFocus: () => false }), true);
assert.strictEqual(S.isAway({ hidden: false, hasFocus: () => true }), false);
// New Calendar (chosen on Home): fixed feasts and fasts on their civil dates; Pascha and its cycle stay Orthodox (Julian computus)
const nw = (y, m, d) => S.seasonOf(new Date(y, m - 1, d), "new");
eq(nw(2026, 12, 25), "nativity", "New: Nativity on Dec 25"); eq(at(2026, 12, 25), "nativityfast", "Old: Dec 25 is still the Nativity Fast");
eq(nw(2027, 1, 5), "nativity", "New: Christmastide to Jan 5"); eq(nw(2027, 1, 6), "theophany", "New: Theophany on Jan 6");
eq(nw(2027, 1, 14), "theophany", "New: Theophany leave-taking Jan 14"); eq(nw(2027, 1, 15), "winter", "New: after Theophany");
eq(nw(2026, 11, 14), "autumn", "New: day before the Nativity Fast"); eq(nw(2026, 11, 15), "nativityfast", "New: Nativity Fast from Nov 15");
eq(nw(2026, 11, 20), "nativityfast", "New: Nov 20 in the fast"); eq(at(2026, 11, 20), "autumn", "Old: Nov 20 not yet the fast");
eq(nw(2026, 11, 21), "entry", "New: Entry Nov 21"); eq(nw(2026, 2, 2), "meeting", "New: Meeting Feb 2");
eq(nw(2026, 3, 25), "annunciation", "New: Annunciation Mar 25 wins over Lent"); eq(nw(2026, 3, 26), "lent", "New: its afterfeast gives way to Lent");
eq(nw(2026, 6, 29), "peterpaul", "New: Ss Peter and Paul Jun 29"); eq(nw(2026, 8, 1), "dormitionfast", "New: Dormition Fast from Aug 1");
eq(nw(2026, 8, 6), "transfiguration", "New: Transfiguration Aug 6"); eq(nw(2026, 8, 15), "dormition", "New: Dormition Aug 15");
eq(nw(2026, 8, 28), "summer", "New: Aug 28 is after the Dormition afterfeast"); eq(at(2026, 8, 28), "dormition", "Old: Aug 28 is the Dormition");
eq(nw(2026, 9, 8), "nativityTheotokos", "New: Nativity of the Theotokos Sep 8"); eq(nw(2026, 9, 14), "exaltation", "New: Exaltation Sep 14");
eq(nw(2026, 10, 1), "protection", "New: Protection Oct 1");
eq(nw(2026, 4, 12), "pascha", "New: Pascha 2026 is the Orthodox one"); eq(nw(2026, 4, 5), "palm", "New: Palm Sunday 2026"); eq(nw(2026, 4, 9), "holyweek", "New: Holy Thursday 2026");
eq(nw(2026, 5, 21), "ascension", "New: Ascension 2026"); eq(nw(2026, 5, 31), "pentecost", "New: Pentecost 2026"); eq(nw(2026, 6, 15), "apostlesfast", "New: Apostles' Fast 2026");
eq(nw(2027, 6, 28), "summer", "New 2027: no Apostles' Fast (All Saints' Monday is Jun 28)"); eq(at(2027, 6, 28), "apostlesfast", "Old 2027: Apostles' Fast");
eq(nw(2027, 3, 15), "lent", "New: Clean Monday 2027"); eq(nw(2027, 5, 2), "pascha", "New: Pascha 2027");
// the New Calendar dates agree with the Home page's feast list on the New Calendar too (2025-2027)
let checkedNew = 0;
for (const y of [2025, 2026, 2027]) {
    const ev = [];
    for (let m = 0; m < 12; m++) for (let d = 1; d <= 28; d += 9) for (const e of h.feasts(new Date(y, m, d), "new").upcoming) ev.push(e);
    for (const [k, d] of S.calendar(y, "new").feasts) {
        if (d.getFullYear() !== y) continue;
        assert.ok(ev.find(e => e.name === names[k] && e.date.getTime() === d.getTime()), `New: ${k} ${d.toDateString()} matches the Home calendar`); checkedNew++;
    }
}
assert.ok(checkedNew >= 36, "checked New " + checkedNew);
// the setting is read from Home's settings ("old" when unset or anything else)
{
    const load0 = BdApi.Data.load;
    BdApi.Data.load = (p, k) => p === "Cl3ar_orthodox_discord" && k === "home.settings" ? { calendar: "new" } : null;
    eq(S.calStyle(), "new", "Home says new"); eq(S.seasonOf(new Date(2026, 11, 25)), "nativity", "seasonOf follows Home's New Calendar");
    BdApi.Data.load = () => ({ calendar: "old" }); eq(S.seasonOf(new Date(2026, 11, 25)), "nativityfast", "seasonOf follows Home's Old Calendar");
    BdApi.Data.load = () => { throw new Error("no store"); }; eq(S.calStyle(), "old", "a broken store falls back to old");
    BdApi.Data.load = load0; eq(S.calStyle(), "old", "unset is old");
}
console.log("Season: all checks passed (" + checked + " Old and " + checkedNew + " New Calendar feast dates cross-checked with Home)");
