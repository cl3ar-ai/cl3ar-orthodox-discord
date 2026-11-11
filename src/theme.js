/**
 * @name OrthodoxTheme
 * @author cl3ar-ai
 * @version 1.0.0
 * @description The Orthodox NeXT look (black, red and gold; the dove, the Calvary cross, the Mother of God behind the chat), built into the plugin so no separate theme is needed.
 */
const CSS = __THEME_CSS__;
const THEME = "Orthodox NeXT";

module.exports = class OrthodoxTheme {
    constructor(meta) { this.name = meta?.name || "OrthodoxTheme"; }
    load() { this.settings = Object.assign({ on: true }, BdApi.Data.load(this.name, "settings") || {}); }
    save() { BdApi.Data.save(this.name, "settings", this.settings); }
    start() {
        this.load();
        if (!this.settings.on) return;
        BdApi.DOM.addStyle(this.name, CSS);
        // the old separate theme is now built in: switch it off once so the two never fight (the file is left alone)
        try {
            const T = globalThis.BdApi?.Themes;
            if (!BdApi.Data.load(this.name, "retired") && T?.isEnabled?.(THEME)) { T.disable(THEME); BdApi.Data.save(this.name, "retired", true); }
        } catch (_) {}
    }
    stop() { BdApi.DOM.removeStyle(this.name); }
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [{ type: "switch", id: "on", name: "Orthodox NeXT look (built in; no separate theme needed)", value: this.settings.on }],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.stop(); this.start(); },
        });
    }
};
