/**
 * @name PlainProfiles
 * @author cl3ar-ai
 * @version 1.1.0
 * @description A calm, professional Discord. Profile pictures stay hidden unless you open someone's profile, are talking to them, or put them in Favorites. The Friends page shows a holy icon (turn the list back on in this plugin's settings). The bottom-left panel keeps only mute, deafen and settings. Strips decorations, nameplates, banners, name fonts, Nitro, Shop and Quests.
 */

const DEFAULTS = { showMine: false, plain: true, hideShop: true, hideFriends: true, minimalPanel: true, holyIcons: true, plainServers: true, showTalking: false, plainBackground: true, noUnreadDots: true, blurIcon: true, blurPx: 14 };
const PLACEHOLDER = "https://cdn.discordapp.com/embed/avatars/0.png";
// gold three-bar cross (same as Orthodox NeXT); used when the theme is off
const CROSS = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 160'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23f3dc98'/%3E%3Cstop offset='.5' stop-color='%23c9a24a'/%3E%3Cstop offset='1' stop-color='%23866424'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23g)' stroke='%235a3f12' stroke-width='1.5' stroke-linejoin='round'%3E%3Crect x='43' y='4' width='14' height='152' rx='1'/%3E%3Crect x='29' y='22' width='42' height='11' rx='1'/%3E%3Crect x='8' y='47' width='84' height='14' rx='1'/%3E%3Cpath d='M24 101 L76 119 L76 131 L24 113 Z'/%3E%3C/g%3E%3C/svg%3E")`;
const AV = `img[src*="/avatars/"]:not([src*="/embed/avatars/"])`;
const MUTE = `:is(button[aria-label="Mute"],button[aria-label="Unmute"])`;
const BG = `[style*="/avatars/"]:not([style*="/embed/avatars/"])`;
// places where you have clicked on someone (their profile) — real pictures allowed there
const PROFILE = [`[class*="userPopout"]`, `[class*="userProfile"]`, `[class*="accountProfilePopout"]`, `[class*="profilePanel"]`, `[class*="userPanelInner"]`];

// what the plugin looks for, so a probe can report which selectors exist in the real Discord
const PROBE = {
    friendsList: `[class*="peopleColumn"]`,
    activeNow: `[class*="nowPlayingColumn"]`,
    friendsTabs: `section[class*="title_"] [class*="tabBar"]`,
    friendsTabs2: `#app-mount:has([class*="peopleColumn"]) [role="tablist"]:has([role="tab"])`,
    panelHidden: `[class*="panels_"] :has(${MUTE}) > :not(:has(button)):not(button)`,
    friendsButton: `[class*="privateChannels"] li:has(a[href="/channels/@me"])`,
    userArea: `[class*="panels_"]`,
    userAvatarName: `[class*="panels_"] [class*="avatarWrapper"]`,
    muteButton: `[class*="panels_"] button[aria-label="Mute"],[class*="panels_"] button[aria-label="Unmute"]`,
    settingsButton: `[class*="panels_"] button[aria-label="User Settings"]`,
    nitroLink: `a[href="/store"]`, shopLink: `a[href="/shop"]`, questLink: `a[href*="quest"]`,
    questPromo: `[class*="quest"]`,
    profilePopout: PROFILE.join(","),
    avatarsImg: AV, avatarsBg: BG,
    spinner: `[class*="spinner_"]`, loadingVideo: `video`, emptyState: `[class*="emptyState"]`,
    serverIcons: `nav[class*="guilds"] img[src*="/icons/"]`, serverTiles: `[data-list-item-id^="guildsnav___"]`,
    decoration: `img[src*="/avatar-decoration-presets/"]`, nameplate: `[src*="/nameplates/"]`,
};

module.exports = class PlainProfiles {
    constructor(meta) {
        this.name = meta?.name || "PlainProfiles";
        this.unsubs = [];
        this.talking = [];
    }

    load() {
        this.favs = new Set(BdApi.Data.load(this.name, "favorites") || []);
        this.settings = Object.assign({}, DEFAULTS, BdApi.Data.load(this.name, "settings") || {});
    }
    save() {
        BdApi.Data.save(this.name, "favorites", [...this.favs]);
        BdApi.Data.save(this.name, "settings", this.settings);
    }

    /* who may show a real picture right now: favorites, the people in the open DM, optionally you */
    keepIds(myId) {
        const keep = new Set(globalThis.__cl3arPinned || []);
        if (this.settings.showTalking) for (const id of this.talking) keep.add(id);
        if (this.settings.showMine && myId) keep.add(myId);
        return [...keep].filter(id => /^\d{5,25}$/.test(String(id)));
    }

    /* pure: builds the whole stylesheet (tested) */
    buildCss(myId) {
        const out = [];
        const keep = this.keepIds(myId);
        // 1. a fast from pictures in the Direct Messages list (pinned people excepted); elsewhere pictures stay
        const notKeep = keep.map(id => `:not([src*="/avatars/${id}/"]):not([src*="/users/${id}/avatars/"])`).join("");
        const notKeepBg = keep.map(id => `:not([style*="/avatars/${id}/"])`).join("");
        const DM = `[class*="privateChannels"]`;
        out.push(`${DM} img[src*="/avatars/"]${notKeep}{display:none!important}`);
        out.push(`${DM} [style*="/avatars/"]${notKeepBg}{background-image:none!important}`);
        // 2. never my own picture, anywhere (unless turned on)
        if (myId && /^\d{5,25}$/.test(String(myId)) && !this.settings.showMine) out.push(`img[src*="/avatars/${myId}/"],img[src*="/users/${myId}/avatars/"]{visibility:hidden!important}
[style*="/avatars/${myId}/"]{background-image:none!important}`);
        // 3. in the DM list the picture space goes for everyone (pinned people too): names line up on the left,
        //    and each name ends with its status (inbox statusCss); pinned people show their picture in the server bar instead
        out.push(`${DM} [class*="avatar_"]{display:none!important}`);
        out.push(`${PROFILE.map(p => `${p} ${AV}`).join(",")}{content:normal!important}`);

        if (this.settings.plain) out.push(`
img[src*="/avatar-decoration-presets/"]{display:none!important}
[class*="profileEffects"]{display:none!important}
img[src*="/nameplates/"],video[src*="/nameplates/"],[class*="nameplatePreview"]{display:none!important}
img[src*="/banners/"],video[src*="/banners/"]{display:none!important}
[style*="/banners/"]{background-image:none!important}
[class*="dnsFont"],[class*="displayNameStyles"]{font-family:inherit!important;background:none!important;
  -webkit-text-fill-color:currentColor!important;text-shadow:none!important;animation:none!important;filter:none!important}
[class*="userProfile"],[class*="custom-theme"]{--profile-gradient-primary-color:var(--background-floating)!important;
  --profile-gradient-secondary-color:var(--background-floating)!important;--profile-gradient-overlay-color:transparent!important;
  --profile-gradient-button-color:var(--button-secondary-background)!important;--profile-gradient-modal-background-color:var(--background-floating)!important}`);

        if (this.settings.hideShop) out.push(`
[class*="privateChannels"] li:has(a[href="/store"]),[class*="privateChannels"] li:has(a[href="/shop"]),
[class*="privateChannels"] li:has(a[href^="/shop/"]),[class*="privateChannels"] li:has(a[href*="quest"]),
[class*="panels_"] [class*="quest"],[class*="nowPlayingColumn"] [class*="quest"],
button[aria-label="Send a gift"],div[aria-label="Send a gift"]{display:none!important}`);

        if (this.settings.hideFriends && !this.friendsOpen) out.push(`
/* Friends stay off the home screen (open them from this plugin's settings): no list, Active Now, header, tabs or Friends button */
[class*="peopleColumn"],[class*="nowPlayingColumn"],
main:has(> [class*="tabBody_"] > [class*="peopleColumn"]) > section,
#app-mount:has(main > [class*="tabBody_"] > [class*="peopleColumn"]) :is([class^="bar_"],[class*=" bar_"]) > [class*="title_"],
[class*="privateChannels"] li:has(a[href="/channels/@me"]),[class*="privateChannels"] [class*="friendsButtonContainer"]{display:none!important}
[class*="tabBody_"]:has(> [class*="peopleColumn"]){background:#0b0b0a!important}`);
        out.push(`#cl3ar-friends-close{position:fixed;z-index:1000;right:16px;top:calc(var(--custom-app-top-bar-height,24px) + 64px);height:30px;padding:0 14px;
 cursor:pointer;font:600 13px var(--nx-font,inherit);color:var(--text-normal,#ddd);background:var(--background-secondary,#222);border:1px solid var(--nx-black,#000)}`);
        if (this.settings.noUnreadDots) out.push(`
/* no white unread dots or pills (red mention counts stay) */
nav[class*="guilds"] [class*="pill"],[class*="containerDefault"] [class*="unread_"],
[class*="privateChannels"] [class*="unread_"],[class*="modeUnread"] [class*="unread_"]{display:none!important}`);
        if (this.settings.blurIcon) out.push(`
/* the icon behind the chat, softly blurred */
[class*="messagesWrapper_"]{background:#101010!important;isolation:isolate;overflow:hidden}
[class*="messagesWrapper_"]::before{content:"";position:absolute;inset:-40px;z-index:-1;pointer-events:none;
  background:linear-gradient(rgba(16,16,16,.78),rgba(16,16,16,.78)),var(--nx-theotokos,var(--nx-icon-theotokos,none)) center 28% / cover no-repeat;filter:blur(${this.settings.blurPx | 0}px)}`);
        if (this.settings.plainBackground) out.push(`
/* no giant picture behind the whole app */
html:root,html body,#app-mount#app-mount{background:#0a0a0a!important}`);

        if (this.settings.plainServers) {
            // server pictures go; each tile shows the server's initials instead (like servers without an icon)
            out.push(`nav[class*="guilds"] img[src*="/icons/"],nav[class*="guilds"] video{visibility:hidden!important}`);
            const tiles = [];
            for (const g of this.guilds || []) {
                if (!/^\d{5,25}$/.test(String(g.id))) continue;
                const acr = this.acronym(g.name).replace(/[\\"\n\r]/g, "");
                tiles.push(`body:not(.styledGuildsAsChannels_71509e) [data-list-item-id="guildsnav___${g.id}"]::after{content:"${acr}"}`);
            }
            if (tiles.length) out.push(`body:not(.styledGuildsAsChannels_71509e) [data-list-item-id^="guildsnav___"]:not([data-list-item-id="guildsnav___home"])::after{position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:var(--text-normal);pointer-events:none}\n` + tiles.join("\n"));
        }

        if (this.settings.holyIcons) out.push(`
/* Discord's moving pictures become a still gold cross */
[class*="spinner_"]{background:var(--nx-cross, ${CROSS}) center / contain no-repeat!important;min-width:16px;min-height:24px}
[class*="spinner_"] > *{visibility:hidden!important}
video[class*="ready_"],video[class*="loop_"]{visibility:hidden!important}
:has(> video[class*="ready_"]),:has(> video[class*="loop_"]){background:var(--nx-cross, ${CROSS}) center / auto 140px no-repeat!important}
[class*="emptyState"] svg,[class*="emptyState"] img,[class*="emptyState"] video{visibility:hidden!important}
[class*="emptyState"]:has(svg,img,video){background:var(--nx-cross, ${CROSS}) center 30% / auto 160px no-repeat!important}`);

        if (this.settings.minimalPanel) out.push(`
/* bottom-left: only mute, deafen, settings */
[class*="panels_"] [class*="avatarWrapper"]{display:none!important}
[class*="panels_"] :has(${MUTE}) > :not(:has(button)):not(button){display:none!important}
[class*="panels_"] :has(${MUTE}){justify-content:flex-start!important;min-height:0!important}
[class*="panels_"] :has(> ${MUTE}){gap:2px;padding-left:4px!important}
/* the account button stays (invisible) so the Status menu can still open from it */
section[class*="panels_"] div[class*="accountPopoutButtonWrapper"][class]{display:block!important;position:absolute!important;left:8px;bottom:8px;
  width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}`);
        return out.join("\n");
    }

    acronym(name = "") {
        const words = String(name).replace(/'s\b/g, "").split(/\s+/).filter(Boolean);
        return words.map(w => [...w][0]).join("").slice(0, 4) || "?";
    }
    readGuilds() {
        const all = this.GuildStore?.getGuilds?.() || {};
        this.guilds = Object.values(all).map(g => ({ id: g.id, name: g.name }));
    }

    apply() {
        const me = this.UserStore?.getCurrentUser?.()?.id;
        const css = this.buildCss(me);
        if (css === this.lastCss) return;
        this.lastCss = css;
        BdApi.DOM.removeStyle(this.name);
        BdApi.DOM.addStyle(this.name, css);
    }

    openFriends() {
        this.friendsOpen = true;
        document.body.classList.add("cl3ar-friends-open");
        if (!document.getElementById("cl3ar-friends-close")) {
            const b = document.createElement("button");
            b.id = "cl3ar-friends-close"; b.type = "button"; b.textContent = "‹ Home";
            b.addEventListener("click", () => this.closeFriends());
            document.body.appendChild(b);
        }
        this.apply();
        const R = BdApi.Webpack.getByKeys?.("transitionTo", "replaceWith");
        try { R?.transitionTo ? R.transitionTo("/channels/@me") : (history.pushState({}, "", "/channels/@me"), dispatchEvent(new PopStateEvent("popstate"))); } catch (_) {}
    }
    openStatus() {
        const b = document.querySelector('[class*="panels_"] [aria-label="Manage profile and status"], [class*="panels_"] [class*="accountPopoutButton_"]');
        if (b) b.click(); else BdApi.UI?.showToast?.("Couldn't find Discord's status menu", { type: "error" });
    }
    closeFriends() {
        this.friendsOpen = false;
        document.body.classList.remove("cl3ar-friends-open");
        document.getElementById("cl3ar-friends-close")?.remove();
        this.apply();
    }
    updateTalking() {
        // leaving the home screen hides Friends again
        if (this.friendsOpen && this.SelectedChannelStore?.getChannelId?.()) this.closeFriends();
        const ch = this.ChannelStore?.getChannel?.(this.SelectedChannelStore?.getChannelId?.());
        const ids = ch && (ch.type === 1 || ch.type === 3) ? (ch.recipients || []).map(r => r?.id ?? r) : [];
        if (ids.join() === this.talking.join()) return;
        this.talking = ids;
        this.apply();
    }

    /* records the most matches seen for each selector into PlainProfiles.config.json (for checking against real Discord) */
    probe() {
        const seen = this.probeSeen || (this.probeSeen = {});
        let changed = false;
        for (const [k, s] of Object.entries(PROBE)) {
            let n = 0;
            try { n = document.querySelectorAll(s).length; } catch (_) { n = -1; }
            if (seen[k] === undefined || n > seen[k]) { seen[k] = n; changed = true; }
        }
        if (changed) BdApi.Data.save(this.name, "probe", { at: new Date().toISOString(), ...seen });
        this.dump();
    }

    /* compact class trees of the parts whose real structure we need (no text, no message content) */
    dump() {
        const d = this.dumpSeen || (this.dumpSeen = {});
        const desc = el => {
            const cls = [...(el.classList || [])].slice(0, 3).join(".");
            const a = el.getAttribute?.("aria-label"), r = el.getAttribute?.("role"), li = el.getAttribute?.("data-list-item-id");
            const src = el.getAttribute?.("src") || el.getAttribute?.("href");
            return `${el.tagName?.toLowerCase()}${cls ? "." + cls : ""}${r ? ` role=${r}` : ""}${a ? ` aria="${a.slice(0, 40)}"` : ""}${li ? ` li=${li.slice(0, 24)}` : ""}${src ? ` src=${src.replace(/\d{6,}/g, "#").slice(0, 60)}` : ""}`;
        };
        const tree = (el, depth, pre = "", out = []) => {
            if (!el || out.length > 80) return out;
            out.push(pre + desc(el));
            if (depth > 0) for (const c of el.children) tree(c, depth - 1, pre + "  ", out);
            return out;
        };
        const up = (el, n) => { const out = []; while (el && n-- > 0) { out.push(desc(el)); el = el.parentElement; } return out; };
        let changed = false;
        const set = (k, v) => { if (v && v.length && !d[k]) { d[k] = v; changed = true; } };
        const mute = document.querySelector('button[aria-label="Mute"],button[aria-label="Unmute"]');
        set("userAreaUp", up(mute, 7));
        set("userArea", tree(mute?.closest('[class*="panels_"]') || mute?.parentElement?.parentElement?.parentElement, 6));
        set("serverTile", tree(document.querySelector('[data-list-item-id^="guildsnav___"]:not([data-list-item-id="guildsnav___home"])')?.parentElement, 6));
        const people = document.querySelector('[class*="peopleColumn"]');
        const tab = [...document.querySelectorAll('[role="tab"],[class*="item_"]')].find(e => e.textContent?.trim() === "Online");
        set("friendsTabUp", up(tab, 6));
        set("friendsPageUp", up(people, 4));
        if (changed) BdApi.Data.save(this.name, "dump", d);
    }

    start() {
        this.load();
        this.onPinned = () => this.apply();
        addEventListener("cl3ar:pinned", this.onPinned);
        this.unsubs.push(() => removeEventListener("cl3ar:pinned", this.onPinned));
        this.onOpenFriends = () => this.openFriends();
        this.onOpenStatus = () => this.openStatus();
        addEventListener("cl3ar:open-status", this.onOpenStatus);
        this.unsubs.push(() => removeEventListener("cl3ar:open-status", this.onOpenStatus));
        addEventListener("cl3ar:open-friends", this.onOpenFriends);
        this.unsubs.push(() => { removeEventListener("cl3ar:open-friends", this.onOpenFriends); if (this.friendsOpen) this.closeFriends(); });
        const W = BdApi.Webpack;
        this.UserStore = W.getStore("UserStore");
        this.ChannelStore = W.getStore("ChannelStore");
        this.SelectedChannelStore = W.getStore("SelectedChannelStore");
        this.onSelect = () => this.updateTalking();
        this.SelectedChannelStore?.addChangeListener?.(this.onSelect);
        this.unsubs.push(() => this.SelectedChannelStore?.removeChangeListener?.(this.onSelect));
        this.GuildStore = W.getStore("GuildStore");
        this.onGuilds = () => { this.readGuilds(); this.apply(); };
        this.GuildStore?.addChangeListener?.(this.onGuilds);
        this.unsubs.push(() => this.GuildStore?.removeChangeListener?.(this.onGuilds));
        this.readGuilds();
        this.updateTalking();
        this.apply();
        const add = (tree, props) => {
            const uid = props?.user?.id;
            const kids = tree?.props?.children;
            if (!uid || !Array.isArray(kids)) return;
            if (uid === this.UserStore?.getCurrentUser?.()?.id) return;
            const on = this.favs.has(uid);
            kids.push(BdApi.ContextMenu.buildItem({ type: "separator" }),
                BdApi.ContextMenu.buildItem({
                    type: "toggle", label: "Favorite (always show picture)", checked: on,
                    action: () => { on ? this.favs.delete(uid) : this.favs.add(uid); this.save(); this.apply(); },
                }));
        };
        // (pictures follow the Inbox pins; no separate favorites menu)
        const ts = [3000, 15000, 60000].map(ms => setTimeout(() => { try { this.probe(); } catch (_) {} }, ms));
        this.unsubs.push(() => ts.forEach(clearTimeout));
    }

    stop() {
        for (const u of this.unsubs) try { u(); } catch (_) {}
        this.unsubs = [];
        this.lastCss = null;
        BdApi.DOM.removeStyle(this.name);
    }

    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "custom", id: "openFriends", name: "Friends", note: "Your friends list, kept off the home screen. Opens until you go to another chat.",
                  children: BdApi.React.createElement("button", { onClick: () => this.openFriends(),
                    style: { padding: "6px 14px", cursor: "pointer", fontWeight: 600 } }, "Open Friends list") },
                { type: "custom", id: "openStatus", name: "Status", note: "Online, Idle, Do Not Disturb, Invisible, custom status.",
                  children: BdApi.React.createElement("button", { onClick: () => this.openStatus(),
                    style: { padding: "6px 14px", cursor: "pointer", fontWeight: 600 } }, "Change status") },
                { type: "switch", id: "hideFriends", name: "Keep Friends off the home screen", value: this.settings.hideFriends },
                { type: "switch", id: "showTalking", name: "Show the picture of the person I'm in a DM with",
                  note: "Off: names only. Pictures show only for people you pin (right-click > Inbox > Favorite).", value: this.settings.showTalking },
                { type: "switch", id: "plainBackground", name: "No big picture behind the app", value: this.settings.plainBackground },
                { type: "switch", id: "noUnreadDots", name: "No white unread dots", note: "Red mention counts still show.", value: this.settings.noUnreadDots },
                { type: "switch", id: "blurIcon", name: "Blur the icon behind the chat", value: this.settings.blurIcon },
                { type: "slider", id: "blurPx", name: "Blur strength", min: 0, max: 30, value: this.settings.blurPx, markers: [0, 5, 10, 15, 20, 25, 30], stickToMarkers: true },
                { type: "switch", id: "minimalPanel", name: "Bottom-left: only mute, deafen and settings",
                  note: "Hides your own picture, name and status there. Change status in Settings.", value: this.settings.minimalPanel },
                { type: "switch", id: "holyIcons", name: "Replace Discord animations with the gold cross",
                  note: "Loading spinners, the start-up animation and the empty-page pictures.", value: this.settings.holyIcons },
                { type: "switch", id: "plainServers", name: "No server pictures (initials instead)", value: this.settings.plainServers },
                { type: "switch", id: "showMine", name: "Show my own picture", value: this.settings.showMine },
                { type: "switch", id: "plain", name: "Strip personalization",
                  note: "Decorations, profile effects, nameplates, banners, name fonts, profile colours.", value: this.settings.plain },
                { type: "switch", id: "hideShop", name: "Hide Nitro, Shop, Quests and gift buttons", value: this.settings.hideShop },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.apply(); },
        });
    }
};
