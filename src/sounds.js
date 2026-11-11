/**
 * @name Bells
 * @author cl3ar-ai
 * @version 1.0.0
 * @description A soft church handbell instead of Discord's message ping (off until you turn it on). Only DMs that reach your Inbox ring at all; Do Not Disturb still silences everything.
 */
const BELL_B64 = /*BELL*/"";                     // filled in by build.js from assets/bell.wav (made by tools/make_bell.py)

module.exports = class Bells {
    constructor(meta) { this.name = meta?.name || "Bells"; }
    load() { this.settings = Object.assign({ bell: false, volume: 60 }, BdApi.Data.load(this.name, "settings") || {}); }
    save() { BdApi.Data.save(this.name, "settings", this.settings); }
    static isMessage(name) { return /^message\d*$/.test(String(name || "")); }
    ring(vol = 1, message = false) {
        if (message && globalThis.__cl3arLiturgy?.()) return true;      // Liturgy quiet: swallowed, nothing plays
        if (!BELL_B64) return false;
        try {
            this.audio ||= new Audio("data:audio/wav;base64," + BELL_B64);
            const a = this.audio.cloneNode();
            a.volume = Math.max(0, Math.min(1, (this.settings.volume / 100) * (typeof vol === "number" ? vol : 1)));
            a.play()?.catch?.(() => {});
            return true;
        } catch (_) { return false; }
    }
    start() {
        this.load();
        const W = BdApi.Webpack, P = BdApi.Patcher;
        this.onRing = () => { if (this.settings.bell) this.ring(1); };        // the church on the Home banner
        addEventListener("cl3ar:ring", this.onRing);
        const mod = W.getByKeys?.("playSound") || W.getByKeys?.("createSound");
        const found = { playSound: typeof mod?.playSound === "function", createSound: typeof mod?.createSound === "function" };
        BdApi.Data.save(this.name, "found", found);
        if (found.playSound) P.instead(this.name, mod, "playSound", (_, args, orig) =>
            Bells.isMessage(args[0]) && globalThis.__cl3arLiturgy?.() ? undefined                    // Liturgy quiet: no message pings
                : this.settings.bell && Bells.isMessage(args[0]) && this.ring(args[1], true) ? undefined : orig(...args));
        if (found.createSound) P.after(this.name, mod, "createSound", (_, args, snd) => {
            if (Bells.isMessage(args[0]) && snd && typeof snd.play === "function") {
                const self = this, own = snd.play;
                snd.play = function () {
                    if (globalThis.__cl3arLiturgy?.()) return undefined;                      // Liturgy quiet
                    return self.settings.bell && self.ring(this?.volume ?? 1, true) ? undefined : own.apply(this, arguments);
                };
            }
            return snd;
        });
    }
    stop() { BdApi.Patcher.unpatchAll(this.name); removeEventListener("cl3ar:ring", this.onRing); }
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "switch", id: "bell", name: "A soft church bell for new messages", note: "Replaces Discord's message ping. Only Inbox DMs ring; Do Not Disturb still silences everything.", value: this.settings.bell },
                { type: "slider", id: "volume", name: "Bell volume", min: 0, max: 100, value: this.settings.volume },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); },
        });
    }
};
