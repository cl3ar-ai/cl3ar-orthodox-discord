const assert = require("assert"), path = require("path");
const listeners = {}; global.addEventListener = (n, f) => { listeners[n] = f; }; global.removeEventListener = n => { delete listeners[n]; };
let saved = {}; const patches = [];
global.BdApi = { Data: { load: (n, k) => saved[k], save: (n, k, v) => { saved[k] = v; } },
  Webpack: { getByKeys: k => k === "playSound" ? mod : null },
  Patcher: { instead: (n, o, m, fn) => { const orig = o[m]; o[m] = (...a) => fn(o, a, orig); patches.push(m); }, after() {}, unpatchAll() { patches.length = 0; } } };
let played = []; const mod = { playSound: (name, vol) => played.push(["discord", name]) };
const Bells = require(path.join(__dirname, "..", "src", "sounds.js"));
const b = new Bells({ name: "t" }); b.start();
assert.deepStrictEqual(saved.found, { playSound: true, createSound: false });
mod.playSound("message1", .5); assert.deepStrictEqual(played.pop(), ["discord", "message1"], "bell off: Discord's sound plays");
b.settings.bell = true; b.ring = v => { played.push(["bell", v]); return true; };
mod.playSound("message1", .5); assert.deepStrictEqual(played.pop(), ["bell", .5], "bell on: the bell rings instead");
mod.playSound("call_ringing", 1); assert.deepStrictEqual(played.pop(), ["discord", "call_ringing"], "other sounds untouched");
b.ring = () => false; mod.playSound("message1", 1); assert.deepStrictEqual(played.pop(), ["discord", "message1"], "if the bell cannot play, Discord's sound still does");
assert.ok(Bells.isMessage("message3") && !Bells.isMessage("mention1"));
// the church on the Home banner rings the bell only when the bell is on
b.ring = v => { played.push(["bell", v]); return true; }; b.settings.bell = false; listeners["cl3ar:ring"](); assert.strictEqual(played.length, 0, "bell off: clicking the church is silent");
b.settings.bell = true; listeners["cl3ar:ring"](); assert.deepStrictEqual(played.pop(), ["bell", 1]);
// Liturgy quiet swallows message pings and the bell
global.__cl3arLiturgy = () => true; b.ring = Bells.prototype.ring.bind(b);
assert.strictEqual(b.ring(1, true), true, "a message ring during the Liturgy is swallowed (nothing plays)");
mod.playSound("message1", 1); assert.strictEqual(played.length, 0, "no Discord ping during the Liturgy");
mod.playSound("call_ringing", 1); assert.deepStrictEqual(played.pop(), ["discord", "call_ringing"], "calls still ring");
delete global.__cl3arLiturgy;
b.stop(); assert.ok(!listeners["cl3ar:ring"], "listener removed on stop");
console.log("Sounds: all checks passed");
