// Joins src/inbox.js, src/profiles.js, src/servers.js into one BetterDiscord plugin: Cl3ar_orthodox_discord.plugin.js
// Usage: node build.js [outDir]   (default outDir = %APPDATA%/BetterDiscord/plugins)
const fs = require("fs"), path = require("path");
const MAIN = "Cl3ar_orthodox_discord";
const outDir = process.argv[2] || path.join(process.env.APPDATA, "BetterDiscord", "plugins");
const parts = [
    { file: "theme.js", ns: "theme", legacy: "OrthodoxTheme", title: "Look: Orthodox NeXT (built-in theme)" },
    { file: "inbox.js", ns: "inbox", legacy: "QuietInbox", title: "Inbox (DM folders, spam, full-screen DMs)" },
    { file: "profiles.js", ns: "profiles", legacy: "PlainProfiles", title: "Profiles, Friends page and panel" },
    { file: "home.js", ns: "home", legacy: "OrthodoxHome", title: "Home screen: Orthodox Today" },
    { file: "servers.js", ns: "servers", legacy: "ServerFiles", title: "Server list as a file tree" },
    { file: "seasonart.js", ns: "season", legacy: "SeasonArt", title: "Living pixel scene (feasts, fasts, weather, time of day)" },
    { file: "sky.js", ns: "sky", legacy: "LivingSky", title: "Living sky: doves across the window" },
    { file: "sounds.js", ns: "sounds", legacy: "Bells", title: "Sounds: the church bell" },
];
const wrap = p => {
    let src = fs.readFileSync(path.join(__dirname, "src", p.file), "utf8");
    src = src.replace(/^\/\*\*[\s\S]*?\*\/\s*/, "");             // drop the per-file BD header
    if (!/module\.exports\s*=/.test(src)) throw new Error(p.file + ": no module.exports");
    src = src.replace(/module\.exports\s*=/, "return");
    if (src.includes('/*BELL*/""')) src = src.replace('/*BELL*/""', () => JSON.stringify(fs.readFileSync(path.join(__dirname, "assets", "bell.wav")).toString("base64")));
    if (src.includes("__THEME_CSS__")) src = src.replace("__THEME_CSS__", () => JSON.stringify(fs.readFileSync(path.join(__dirname, "src", "theme.css"), "utf8")));
    // each part gets its own scope and a BdApi whose Data is stored inside the one plugin's config
    return `parts.push({ title: ${JSON.stringify(p.title)}, ns: ${JSON.stringify(p.ns)}, Cls: ((BdApi) => {\n${src}\n})(scopedApi(${JSON.stringify(p.ns)}, ${JSON.stringify(p.legacy)})) });`;
};
const out = `/**
 * @name ${MAIN}
 * @author cl3ar-ai
 * @version 2.0.0
 * @description A quiet, Orthodox Discord in one plugin: email-style DM folders (Inbox, Favorites, Unread, Snoozed, Archive, Spam, Ignored, Blocked), an Orthodox Today home page (Old or New Calendar day, readings, saints and their lives, fasting calendar, feasts, commemorations, world news), a living pixel-art scene that follows the Church year, the time of day and the weather, doves that cross the window, the Orthodox NeXT look built in, and an optional church bell.
 * @website https://github.com/cl3ar-ai/cl3ar-orthodox-discord
 * @source https://github.com/cl3ar-ai/cl3ar-orthodox-discord
 */
/* Built from src/ by build.js — edit the sources, not this file. */

const BD = globalThis.BdApi;
const MAIN = ${JSON.stringify(MAIN)};
const scopedApi = (ns, legacy) => ({
    Webpack: BD.Webpack, Patcher: BD.Patcher, ContextMenu: BD.ContextMenu, DOM: BD.DOM, React: BD.React, Net: BD.Net,
    Data: {
        load(_, key) {
            const v = BD.Data.load(MAIN, ns + "." + key);
            return v !== undefined ? v : BD.Data.load(legacy, key); // carries over data from the old separate plugins
        },
        save(_, key, value) { BD.Data.save(MAIN, ns + "." + key, value); },
    },
    UI: Object.assign({}, BD.UI, { buildSettingsPanel: cfg => cfg }), // parts hand back their settings; the main panel draws them
});
const parts = [];
${parts.map(wrap).join("\n\n")}

module.exports = class Cl3ar_orthodox_discord {
    constructor(meta) {
        this.mods = parts.map(p => ({ ...p, inst: new p.Cls({ name: "Cl3ar_" + p.ns }) }));
    }
    start() {
        for (const m of this.mods) {
            try { m.inst.start(); } catch (e) { console.error("[" + MAIN + "] " + m.ns + " failed to start", e); }
        }
    }
    stop() {
        for (const m of [...this.mods].reverse()) {
            try { m.inst.stop(); } catch (e) { console.error("[" + MAIN + "] " + m.ns + " failed to stop", e); }
        }
    }
    getSettingsPanel() {
        const cats = [];
        this.mods.forEach((m, i) => {
            const cfg = m.inst.getSettingsPanel?.();
            if (cfg?.settings?.length) cats.push({ type: "category", id: m.ns, name: m.title, collapsible: true, shown: i === 0, settings: cfg.settings, onChange: cfg.onChange });
        });
        return BD.UI.buildSettingsPanel({
            settings: cats.map(({ onChange, ...c }) => c),
            onChange: (cat, id, value) => cats.find(c => c.id === cat)?.onChange?.(cat, id, value),
        });
    }
};
`;
const file = path.join(outDir, MAIN + ".plugin.js");
fs.writeFileSync(file, out);
console.log("built", file, out.length, "bytes");
