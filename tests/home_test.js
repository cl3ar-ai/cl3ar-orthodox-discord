// Unit tests for the home part: Old Calendar feasts/fasts and prayers by time of day.
const assert = require("assert");
const path = require("path");
const SRC = process.argv[2] || path.join(__dirname, "..", "src");
global.BdApi = { Data: { load: () => null, save() {} }, Net: { fetch: async u => { throw new Error("offline in tests: " + u); } } }; // never the real network
const Home = require(path.join(SRC, "home.js"));
const ymd = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Orthodox Pascha (civil dates)
assert.strictEqual(ymd(Home.julianPascha(2025)), "2025-4-20");
assert.strictEqual(ymd(Home.julianPascha(2026)), "2026-4-12");
assert.strictEqual(ymd(Home.julianPascha(2027)), "2027-5-2");
assert.strictEqual(ymd(Home.julianPascha(2024)), "2024-5-5");

const h = new Home({});
// 11 Nov 2026 (civil) = 29 Oct Old Calendar: no fast yet; Nativity Fast starts 15 Nov O.S. = 28 Nov civil
let f = h.feasts(new Date(2026, 10, 11));
assert.strictEqual(f.current, null, "no fast on 11 Nov 2026");
assert.deepStrictEqual(f.upcoming.slice(0, 3).map(e => [e.name, e.in]),
    [["Nativity Fast begins", 17], ["Entry of the Theotokos", 23], ["Nativity of Christ", 57]]);
// inside the Nativity Fast
f = h.feasts(new Date(2026, 11, 10));
assert.strictEqual(f.current.name, "Nativity Fast");
assert.strictEqual(f.current.day, 13);
// Great Lent 2027: Clean Monday = Pascha - 48 = 15 Mar 2027
f = h.feasts(new Date(2027, 2, 15));
assert.strictEqual(f.current.name, "Great Lent and Holy Week");
assert.strictEqual(f.current.day, 1);

// prayers follow the time of day
assert.strictEqual(h.prayers(new Date(2026, 10, 11, 7)).title, "Prayer during the day"); // no morning prayers card (removed 2026-11-11)
assert.strictEqual(h.prayers(new Date(2026, 10, 11, 15)).title, "Prayer during the day"); // 1 pm is now a mealtime (before meals)
assert.strictEqual(h.prayers(new Date(2026, 10, 11, 22)).title, "Evening prayers");
console.log("Home: all checks passed");

// what the fast allows
{
  const F = Home.fastFoods;
  assert.deepStrictEqual(F("Fast"), { meat: false, dairy: false, fish: false, wine: false, oil: false }, "plain fast day (Wednesday)");
  assert.deepStrictEqual(F("Fast — Wine and Oil are Allowed"), { meat: false, dairy: false, fish: false, wine: true, oil: true });
  assert.deepStrictEqual(F("Fast — Fish, Wine and Oil are Allowed"), { meat: false, dairy: false, fish: true, wine: true, oil: true });
  assert.strictEqual(F("Lenten Fast — Fish Roe, Wine and Oil are Allowed").fish, false); assert.strictEqual(F("Lenten Fast — Fish Roe, Wine and Oil are Allowed").roe, true);
  assert.deepStrictEqual(F(""), { meat: true, dairy: true, fish: true, wine: true, oil: true }, "no fast");
  assert.deepStrictEqual(F("Fast Free"), { meat: true, dairy: true, fish: true, wine: true, oil: true });
  assert.strictEqual(F("Cheesefare Week — Meat Fast").meat, false); assert.strictEqual(F("Cheesefare Week — Meat Fast").dairy, true);
  assert.strictEqual(F("Strict Fast").oil, false);
}
console.log("Home extras: all checks passed");

// the fasting calendar (Typikon's general rules), 2026: Pascha Apr 12
{
  const F = (y, m, d) => Home.fastDay(new Date(y, m - 1, d));
  const cases = [[2026, 11, 11, "strict", "an ordinary Wednesday"], [2026, 11, 12, "free", "an ordinary Thursday"], [2026, 11, 13, "strict", "an ordinary Friday"],
    [2026, 12, 1, "fish", "Tuesday in the Nativity Fast"], [2026, 11, 30, "oil", "Monday in the Nativity Fast"], [2026, 12, 2, "strict", "Wednesday in the Nativity Fast"],
    [2026, 12, 4, "fish", "Entry of the Theotokos (Friday)"], [2027, 1, 3, "strict", "Sunday before Nativity is late fast: weekend oil?"],
    [2027, 1, 7, "free", "Nativity"], [2027, 1, 8, "free", "Christmastide Friday"], [2027, 1, 18, "strict", "Theophany eve"],
    [2026, 2, 4, "free", "Wednesday of the Publican and Pharisee week"], [2026, 2, 18, "meat", "Cheesefare Wednesday"],
    [2026, 3, 4, "strict", "Wednesday in Lent"], [2026, 3, 7, "oil", "Saturday in Lent"], [2026, 4, 5, "fish", "Palm Sunday"], [2026, 4, 7, "fish", "Annunciation in Holy Week"],
    [2026, 4, 10, "strict", "Holy Friday"], [2026, 4, 15, "free", "Bright Wednesday"], [2026, 6, 3, "free", "Wednesday of Trinity week"],
    [2026, 6, 16, "fish", "Tuesday in the Apostles' Fast"], [2026, 6, 17, "strict", "Wednesday in the Apostles' Fast"],
    [2026, 8, 19, "fish", "Transfiguration"], [2026, 8, 18, "strict", "Tuesday in the Dormition Fast"], [2026, 8, 22, "oil", "Saturday in the Dormition Fast"],
    [2026, 9, 11, "strict", "Beheading of the Forerunner"], [2026, 9, 27, "oil", "Exaltation of the Cross"], [2026, 8, 28, "free", "Dormition (Friday) - after the fast, a feast"]];
  // fix the one case whose expectation depends on the late Nativity Fast (Jan 2-6 civil): Sunday Jan 3 2027 -> oil
  cases[7] = [2027, 1, 3, "oil", "Sunday in the last days of the Nativity Fast"];
  // Dormition 2026 falls on a Friday: a feast on Friday allows fish
  cases[cases.length - 1] = [2026, 8, 28, "fish", "Dormition on a Friday: fish"];
  for (const [y, m, d, want, why] of cases) assert.strictEqual(F(y, m, d), want, `${y}-${m}-${d} ${why}`);
  global.document = { querySelector: () => null };
  const h3 = new Home({ name: "t" }); const html = h3.calendarHtml();
  assert.ok((html.match(/class="c-d c-(free|meat|fish|oil|strict)/g) || []).length >= 28, "a month of days");
}
console.log("Fasting calendar: all checks passed");

// greetings and name days
{
  assert.strictEqual(Home.greeting(new Date(2026, 3, 12)), "Christ is Risen! Truly He is Risen!", "Pascha 2026");
  assert.strictEqual(Home.greeting(new Date(2026, 4, 20)), "Christ is Risen! Truly He is Risen!", "P+38 still Paschal");
  assert.strictEqual(Home.greeting(new Date(2026, 4, 21)), "Christ is Ascended! From earth to heaven!", "Ascension");
  assert.strictEqual(Home.greeting(new Date(2027, 0, 7)), "Christ is Born! Glorify Him!", "Nativity");
  assert.strictEqual(Home.greeting(new Date(2026, 0, 19)), "Christ is Baptized! In the river Jordan!", "Theophany");
  assert.strictEqual(Home.greeting(new Date(2026, 10, 11)), "", "an ordinary day");
  const nd = Home.nameDays(["Martyr Anastasia the Roman", "Ven. Avram of Rostov", "Our Holy Father Abramius (366) and his niece Mary (371) of Mesopotamia"],
    [{ id: "1", name: "Anastasia K" }, { id: "2", name: "mary_g" }, { id: "3", name: "Holy" }, { id: "4", name: "Bob" }, { id: "5", name: "the" }]);
  assert.deepStrictEqual(nd.map(n => n.name), ["Anastasia", "mary"], JSON.stringify(nd));
}
console.log("Greetings and name days: all checks passed");
// commemoration book and mealtime prayers
{
  const saved = {}; global.BdApi.Data = { load: (n, k) => saved[k], save: (n, k, v) => { saved[k] = JSON.parse(JSON.stringify(v)); } };
  const h4 = new Home({ name: "t" });
  assert.ok(h4.addName("living", "  John   the  Soldier ")); assert.ok(!h4.addName("living", "John the Soldier"), "no duplicates");
  assert.ok(h4.addName("departed", "Maria")); assert.ok(!h4.addName("nope", "x")); assert.ok(!h4.addName("living", "   "));
  assert.deepStrictEqual(saved.names, { living: ["John the Soldier"], departed: ["Maria"] }, "kept");
  const html = h4.namesHtml(); assert.ok(html.includes("Save, O Lord, and have mercy on Thy servants: John the Soldier.") && html.includes("make their memory eternal"));
  assert.ok(h4.addName("living", "<img src=x onerror=alert(1)>") && !h4.namesHtml().includes("<img src=x"), "names are escaped");
  assert.ok(h4.delName("living", 1) && h4.names().living.length === 1);
  const P = hr => h4.prayers(new Date(2026, 10, 11, hr)).title;
  assert.strictEqual(P(12), "Prayer before meals"); assert.strictEqual(P(14), "Prayer after meals"); assert.strictEqual(P(8), "Prayer during the day"); assert.strictEqual(P(22), "Evening prayers"); assert.strictEqual(P(16), "Prayer during the day");
}
console.log("Commemorations and meal prayers: all checks passed");
// the service of the hour, and the verse of the day
{
  assert.strictEqual(Home.hourOf(2), "Midnight Office"); assert.strictEqual(Home.hourOf(5), "Matins"); assert.strictEqual(Home.hourOf(8), "First Hour");
  assert.strictEqual(Home.hourOf(10), "Third Hour"); assert.strictEqual(Home.hourOf(13), "Sixth Hour"); assert.strictEqual(Home.hourOf(16), "Ninth Hour");
  assert.strictEqual(Home.hourOf(19), "Vespers"); assert.strictEqual(Home.hourOf(22), "Compline");
  const v = Home.verseOf({ readings: [{ source: "Epistle", display: "1 Thess 4.1-12", text: [{ v: 1, t: "Furthermore then we beseech you, brethren" }] },
    { source: "Gospel", display: "Luke 11.9-13", text: [{ v: 9, t: "And I say unto you, Ask, and it shall be given you; seek, and ye shall find" }] }] });
  assert.deepStrictEqual(v, { text: "And I say unto you, Ask, and it shall be given you; seek, and ye shall find", ref: "Luke 11.9-13" });
  assert.strictEqual(Home.verseOf({}), null);
}
console.log("Hours and verse: all checks passed");
// liturgical colours
assert.strictEqual(Home.litColour("pascha"), "#d8483a"); assert.strictEqual(Home.litColour("dormition"), "#6f9ad8"); assert.strictEqual(Home.litColour("pentecost"), "#6aae5a");
assert.strictEqual(Home.litColour("exaltation"), "#9a6ab8"); assert.strictEqual(Home.litColour("autumn"), "#d4b062"); assert.strictEqual(Home.litColour(undefined), "#d4b062");
console.log("Liturgical colours: all checks passed");

// St Demetrius (2026-11-11): outside links, lives of the saints, the calendar's days, Old / New calendar
{
  const fs = require("fs"), FX = f => fs.readFileSync(path.join(__dirname, "fixtures", f), "utf8");
  // every outside link goes to window.open (Discord hands that to the system browser); nothing else is opened
  const opened = []; global.window = { open: (...a) => { opened.push(a); return null; } };
  assert.ok(Home.openOut("https://www.bbc.co.uk/news/world-1"), "https link opens");
  assert.deepStrictEqual(opened, [["https://www.bbc.co.uk/news/world-1", "_blank", "noopener,noreferrer"]]);
  assert.ok(!Home.openOut("javascript:alert(1)") && !Home.openOut("http://x.test/a") && !Home.openOut(""), "only https links");
  assert.strictEqual(opened.length, 1);
  assert.ok(Home.openOut(new Home({}).livesUrl("Apostles' Fast begins", "feast")) && opened[1][0].includes("%27"), "an apostrophe never makes a dead link");
  delete global.window;

  // saint names as OrthodoxWiki titles them
  const N = Home.saintNames;
  assert.deepStrictEqual(N("Martyr Anastasia the Roman"), ["Anastasia the Roman"]);
  assert.deepStrictEqual(N("Our Righteous Father Theodore the Studite (826)"), ["Theodore the Studite"]);
  assert.deepStrictEqual(N("Relics Ven. John of Rila"), ["John of Rila"]);
  assert.deepStrictEqual(N("Righteous John, Wonderworker of Kronstadt (1908)."), ["John, Wonderworker of Kronstadt", "John of Kronstadt"]);
  assert.deepStrictEqual(N("Holy Hieromartyr Sadoth (Shahdost) and his 128 companions (342)"), ["Sadoth and his 128 companions"], "no bare one-word guess");
  assert.ok(N("St John Chrysostom, Archbishop of Constantinople").includes("John Chrysostom"));
  // a real OrthodoxWiki answer (tests/fixtures/orthodoxwiki-fixture.json): pages found -> direct links; missing or disambiguation -> none
  const saints = ["Martyr Anastasia the Roman", "Ven. Avram of Rostov", "Righteous John, Wonderworker of Kronstadt (1908).", "St John Chrysostom, Archbishop of Constantinople", "Prophet Joel"];
  const map = Home.livesFromWiki(FX("orthodoxwiki-fixture.json"), saints);
  assert.deepStrictEqual(map, { "Martyr Anastasia the Roman": "https://orthodoxwiki.org/Anastasia_the_Roman",
    "Righteous John, Wonderworker of Kronstadt (1908).": "https://orthodoxwiki.org/John_of_Kronstadt",
    "St John Chrysostom, Archbishop of Constantinople": "https://orthodoxwiki.org/John_Chrysostom" });
  const h5 = new Home({ name: "t" }); h5.lives = map;
  assert.strictEqual(h5.livesUrl("Martyr Anastasia the Roman"), "https://orthodoxwiki.org/Anastasia_the_Roman");
  const s2 = h5.livesUrl("Ven. Avram of Rostov");
  assert.ok(s2.startsWith("https://duckduckgo.com/?q=") && decodeURIComponent(s2).endsWith("Avram of Rostov Orthodox saint life"), "no page -> a plain web search for the life (for everyone, no site excluded): " + s2);
  assert.ok(/^<a class="h-life" href="https:\/\/orthodoxwiki\.org\/Anastasia_the_Roman"[^>]*>Martyr Anastasia the Roman<\/a>$/.test(h5.saintLink("Martyr Anastasia the Roman")));
  assert.ok(!h5.saintLink("<img src=x onerror=alert(1)>").includes("<img"), "saint names are escaped");

  // the calendar takes its fasts from orthocal's month list (the same source as the Fast line); real data for November 2026 (Old Calendar)
  const L = Home.levelOf;
  assert.strictEqual(L({ fast_level: 0, fast_exception: 2, fast_exception_desc: "Fish, Wine and Oil are Allowed" }), "free", "a feast's allowance on a free day");
  assert.strictEqual(L({ fast_level: 1, fast_exception: 0, fast_exception_desc: "" }), "strict");
  assert.strictEqual(L({ fast_level: 1, fast_exception: 7, fast_exception_desc: "Meat Fast" }), "meat");
  assert.strictEqual(L({ fast_level: 5, fast_exception: 2, fast_exception_desc: "Fish, Wine and Oil are Allowed" }), "fish");
  assert.strictEqual(L({ fast_level: 5, fast_exception: 1, fast_exception_desc: "Wine and Oil are Allowed" }), "oil");
  assert.strictEqual(L({ fast_level: 1, fast_exception: 8, fast_exception_desc: "Strict Fast (Wine and Oil)" }), "oil");
  assert.strictEqual(L({ fast_level: 1, fast_exception: 11, fast_exception_desc: "Fast Free" }), "free");
  assert.strictEqual(L({ fast_level: 2, fast_exception: 10, fast_exception_desc: "No overrides" }), "strict");
  const nov = Home.parseMonth(FX("orthocal-julian-2026-11.json"), 2026, 11);
  assert.strictEqual(nov.length, 30);
  assert.deepStrictEqual([nov[10].lv, nov[10].church], ["strict", "29 October"], "Wed 11 Nov = 29 Oct O.S., a fast day");
  assert.strictEqual(nov[7].lv, "free", "Sun 8 Nov, St Demetrius: no fast");
  assert.strictEqual(nov[29].lv, "strict", "Mon 30 Nov in the Nativity Fast (orthocal)");
  assert.strictEqual(Home.parseMonth(FX("orthocal-julian-2026-11.json"), 2026, 12), null, "a list that does not fit the month is refused");
  assert.strictEqual(Home.parseMonth('{"not":"a list"}', 2026, 11), null);
  const dec = Home.parseMonth(FX("orthocal-gregorian-2026-12.json"), 2026, 12);
  assert.strictEqual(dec[24].lv, "free"); assert.ok(dec[24].feasts.includes("Nativity of Christ"), "New Calendar: Nativity on 25 Dec");
  assert.strictEqual(dec[0].lv, "oil", "New Calendar: 1 Dec in the Nativity Fast, wine and oil");

  // the calendar card: orthocal's colours when the month is there; a click on a day shows its fast, feasts and linked saints
  global.document = { querySelector: () => null, getElementById: () => null };
  const h6 = new Home({ name: "t" }); h6.settings = { calendar: "old" }; h6.lives = {};
  const now = new Date(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  h6.months = new Map([[`old:${now.getFullYear()}-${now.getMonth() + 1}`, Array.from({ length: dim },
    (_, i) => ({ lv: i === 0 ? "meat" : "free", fast: i === 0 ? "Fast — Meat Fast" : "No Fast", church: "1 January", feasts: i === 1 ? ["Some Feast"] : [], saints: ["Martyr Anastasia the Roman"] }))]]);
  let html = h6.calendarHtml();
  assert.ok(/class="c-d c-meat[^"]*" data-day="1"/.test(html), "the colour comes from the month list");
  assert.ok(!html.includes("c-info"), "no day open yet");
  h6.calDay = 2; html = h6.calendarHtml();
  assert.ok(/class="c-d c-free[^"]*c-sel" data-day="2"/.test(html), "the clicked day is marked");
  assert.ok(html.includes("c-info") && html.includes("Some Feast") && html.includes("(Old Calendar)") && html.includes('class="h-life"') && html.includes("Anastasia"), "day details with feast and linked saints");
  h6.months = new Map(); h6.calDay = 0; html = h6.calendarHtml();
  assert.ok(html.includes("Typikon's general rules"), "without the month list the general rules stand in");
}
console.log("Links, lives and calendar days: all checks passed");
// Old / New calendar
{
  const F = (y, m, d, c) => Home.fastDay(new Date(y, m - 1, d), c);
  assert.strictEqual(F(2026, 12, 25, "new"), "free", "New Calendar Nativity");
  assert.strictEqual(F(2026, 12, 30, "new"), "free", "New Calendar Christmastide");
  assert.strictEqual(F(2026, 11, 20, "new"), "strict", "New Calendar: Friday in the Nativity Fast");
  assert.strictEqual(F(2026, 11, 17, "new"), "fish", "New Calendar: Tuesday in the Nativity Fast");
  assert.strictEqual(F(2026, 11, 17, "old"), "free", "Old Calendar: no fast yet on a Tuesday");
  assert.strictEqual(F(2027, 1, 18, "new"), "free", "New Calendar: 18 Jan is an ordinary Monday");
  assert.strictEqual(F(2027, 1, 5, "new"), "strict", "New Calendar: Theophany eve (Tue 5 Jan)");
  assert.strictEqual(F(2026, 4, 10, "new"), F(2026, 4, 10, "old"), "Holy Friday is the same on both (Orthodox Pascha)");
  const hn = new Home({});
  let f = hn.feasts(new Date(2026, 10, 11), "new");
  assert.deepStrictEqual(f.upcoming.slice(0, 3).map(e => [e.name, e.in]), [["Nativity Fast begins", 4], ["Entry of the Theotokos", 10], ["Nativity of Christ", 44]]);
  f = hn.feasts(new Date(2027, 4, 2), "new");
  assert.strictEqual(f.upcoming[0].name, "Holy Pascha", "Pascha 2027 on 2 May on the New Calendar too");
  assert.deepStrictEqual(hn.feasts(new Date(2026, 10, 11)).upcoming[0], hn.feasts(new Date(2026, 10, 11), "old").upcoming[0], "Old Calendar is the default");
  assert.strictEqual(Home.greeting(new Date(2026, 11, 25), "new"), "Christ is Born! Glorify Him!");
  assert.strictEqual(Home.greeting(new Date(2027, 0, 3), "new"), "Christ is Born! Glorify Him!");
  assert.strictEqual(Home.greeting(new Date(2027, 0, 7), "new"), "Christ is Baptized! In the river Jordan!");
  assert.strictEqual(Home.greeting(new Date(2027, 0, 7)), "Christ is Born! Glorify Him!", "Old Calendar default unchanged");
  assert.strictEqual(Home.greeting(new Date(2026, 11, 25)), "", "Old Calendar: 25 Dec civil is not yet Nativity");
  assert.strictEqual(Home.prototype.cal.call({ settings: { calendar: "bogus" } }), "old");
  // the setting: default "old", saved under home.settings.calendar (St Sergius reads it there); the right orthocal endpoint and cache key
  const saved = {}, urls = [];
  global.BdApi = { Data: { load: (n, k) => saved[k], save: (n, k, v) => { saved[k] = JSON.parse(JSON.stringify(v)); } },
    Net: { fetch: async u => { urls.push(u); if (!u.includes("orthocal")) throw new Error("offline"); return { ok: true, text: async () => JSON.stringify({ titles: ["T"], month: 11, day: 11, saints: [], readings: [] }) }; } } };
  const h7 = new Home({ name: "t" }); h7.load();
  assert.strictEqual(saved.settings.calendar, "old", "default saved so other parts can read it");
  h7.settings.news = h7.settings.world = false; h7.render = () => {};
  (async () => {
    await h7.refreshData();
    assert.ok(urls[0].startsWith("https://orthocal.info/api/julian/"), urls[0]); assert.ok(saved.day.key.startsWith("julian:"));
    h7.settings.calendar = "new"; urls.length = 0; await h7.refreshData();
    assert.ok(urls[0].startsWith("https://orthocal.info/api/gregorian/"), urls[0]); assert.ok(saved.day.key.startsWith("gregorian:"), "a change of calendar never shows the cached day of the other");
    console.log("Old / New calendar: all checks passed");
  })().catch(e => { console.error(e); process.exit(1); });
}
