/**
 * @name QuietInbox
 * @author cl3ar-ai
 * @version 1.0.0
 * @description Email-style DM folders: Inbox, Starred, Archive, Spam. Ignored and blocked people go straight to Spam and never appear in the DM list, the server bar, badges or notifications, not even for a frame. Right-click a DM to mark spam, archive or star it.
 */

const FOLDERS = ["inbox", "favorites", "unread", "snoozed", "archive", "spam", "ignored", "blocked"];
const LABELS = { inbox: "Inbox", favorites: "Favorites", unread: "Unread", snoozed: "Snoozed", archive: "Archive", spam: "Spam", ignored: "Ignored", blocked: "Blocked" };
const HIDDEN = new Set(["spam", "ignored", "blocked"]); // never shown in Inbox, never ping
/* ---------- pixel art ----------
 * Every picture is a strip of frames (frame 0 = the resting pose, shown when motion is off) with its own palette.
 * '.' is empty. Shared family colours: gold, ruby and flame (the Home and server icons use the same ones). */
const PAL = {
    gold: { A: "#fff3c4", B: "#f0d27a", C: "#d9b24e", D: "#a8822e", E: "#6e5018" },
    ruby: { h: "#ff8f78", p: "#ffd2c4", r: "#e04a3c", s: "#b0242a", t: "#6e1418", u: "#ff7a52" },
    flame: { w: "#fffdf0", y: "#ffe27a", o: "#ffae34", q: "#f0701e", g: "#ffb43a40" },
};
// put a block of pixels at x,y (a space in the block keeps what is under it)
const put = (rows, x, y, block) => rows.map((r, j) => {
    const b = block[j - y]; if (b === undefined) return r;
    const s = [...r]; [...b].forEach((ch, i) => { if (ch !== " " && x + i < s.length) s[x + i] = ch; }); return s.join("");
});
const dots = (rows, ch, pts) => pts.reduce((rs, [x, y]) => put(rs, x, y, [ch]), rows);
const up = rows => [...rows.slice(1), ".".repeat(rows[0].length)];
const sh = (row, n) => n > 0 ? ".".repeat(n) + row.slice(0, -n) : row.slice(-n) + ".".repeat(-n);
// frames side by side in one SVG strip (runs of a colour become one rectangle)
const sheetSvg = (frames, pal) => {
    const w = frames[0][0].length, h = frames[0].length, d = {};
    frames.forEach((rows, f) => rows.forEach((r, y) => r.replace(/(.)\1*/g, (run, ch, x) => {
        if (pal[ch]) d[ch] = (d[ch] || "") + `M${f * w + x} ${y}h${run.length}v1h-${run.length}z`; return run; })));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w * frames.length} ${h}' shape-rendering='crispEdges'>${Object.keys(d).map(k => `<path fill='${pal[k]}' d='${d[k]}'/>`).join("")}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const sheet = a => sheetSvg(a.frames, a.pal);

// a small Orthodox picture for every folder: 13x13, four frames each (rest + a little idle motion)
const ICON = (() => {
    const G = PAL.gold, R = PAL.ruby, F = PAL.flame;
    // an epistle with a red wax seal: it lifts and the seal glints
    const epistle = [".............", ".............", "KKKKKKKKKKKKK", "KcaaaaaaaaacK", "KbcaaaaaaacbK", "KbbcaaaaacbbK", "KbbbcsrscbbbK",
        "KbbbshrrtbbbK", "KbbbbtstbbbbK", "KbbbbbbbbbbbK", "KcccccccccccK", "KKKKKKKKKKKKK", "............."];
    // the lampada: ruby glass in a gold rim, hung on three chains, an amber flame that never goes out
    const lampada = ["......C......", ".....C.C.....", "....D.o.D....", "...C..y..C...", "..D..oyo..D..", ".C...ywy...C.", "KABBBBBBCCDDK",
        ".thprrrrrsst.", ".thrrrrrrsst.", "..thrrrrsst..", "...thrrsst...", "....DBBCD....", ".....DCD....."];
    const flick = [[" . ", ".o.", ".y.", "oyo", "ywy"], [" . ", "o..", ".y.", "oyo", "ywy"], [" o ", ".y.", "oyo", "ywy", "ywy"], [" . ", "..o", ".y.", "oyo", "ywy"]];
    // a beeswax candle in a brass dish, its flame blue-white at the heart
    const candle = ["......o......", "......y......", ".....oyo.....", ".....yzy.....", "......u......", "....abkcd....", "....abbcd....",
        "....abbcd....", "....abbcd....", "....abbcd....", "....abbcd....", "..ABBBBBBCD..", "...EDDDDDE..."];
    const cflick = [[".o.", ".y.", "oyo", "yzy", ".u."], ["o..", ".y.", "oyo", "yzy", ".u."], ["...", ".o.", "oyo", "yzy", ".u."], ["..o", ".y.", "oyo", "yzy", ".u."]];
    // an hourglass of walnut and glass: the sand runs
    const glass = [".aaaaaaaaaab.", ".bbbbbbbbbbc.", ".a.lmmmmml.c.", ".a.lSSSSSl.c.", ".a..lTTTl..c.", ".a...lTl...c.", ".a....S....c.",
        ".a...lSl...c.", ".a..lmSml..c.", ".a.lmSSSml.c.", ".a.lTTTUUl.c.", ".aaaaaaaaaab.", ".bbbbbbbbbbc."];
    // a reliquary of cedar and gold with a ruby window: the lid lifts and light spills out
    const reliq = [".............", "......B......", ".....ABC.....", "....ABBCD....", "..BeeeffggD..", ".ABBBBBBBCCD.", "..eeABBBCgh..",
        "..eeBhrsDgh..", "..efBrstDgh..", "..efCDDDEgh..", "..fffgggghh..", ".ABBBBBBBCCD.", "..D.......D.."];
    const lid = [...reliq.slice(1, 6), "..yyyWyWyyy.."];                 // the roof one pixel up, light under it
    // a straw broom bound with red thread: it sweeps
    const broom = ["......a......", "......b......", "......b......", "......c......", ".....STU.....", ".....rrs.....", "....STTUV....",
        "....rrrss....", "...STTTUUV...", "..STSTTUTUV..", "..STTSTUTUV..", ".STSTSTUTUVV.", ".S.T.S.U.U.V."];
    const sweep = n => broom.map((r, y) => y >= 11 ? sh(r, n) : r);
    // a shut double door of oak with iron bands and studs: it creaks ajar and warm light shows
    const door = ["....KKKKK....", "...KabdbcK...", "..KabbdbccK..", "..KijijijkK..", "..KabbdbccK..", "..KabbdbccK..", "..KabidiccK..",
        "..KabjdjccK..", "..KabbdbccK..", "..KijijijkK..", "..KabbdbccK..", "..KabbdbccK..", ".mmmmmmmmmnn."];
    const gap = (rows, x, ch) => dots(rows, ch, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(y => [x, y]));
    const ajar1 = gap(door, 6, "y"), ajar2 = gap(gap(gap(door, 5, "y"), 7, "y"), 6, "W");
    // a shield of cobalt and silver bearing the cross: a glint runs across it
    const shield = [".ABBBBBBBBCD.", ".BefffWggghD.", ".BefffWggghD.", ".BefffWggghD.", ".BeWWWWWWXhD.", ".BefffWggghD.", ".BefffWggghD.",
        "..BeffWgghD..", "...BefWggD...", "....BeWgD....", ".....BWD.....", "......C......", "............."];
    const glint = c => dots(shield, "A", [[c, 1], [c - 1, 2], [c - 2, 3]]);
    // the three-bar cross over the folder list
    const cross = ["....B....", "..ABBBC..", "....B....", "ABBBrBCCD", "....B....", "....B....", "....C....", "....C....", "..BBC....",
        "....CDD..", "....C....", "....D....", "....D...."];
    return {
        inbox: { pal: { K: "#3a2614", a: "#fbf1d4", b: "#ecd59c", c: "#c9a465", ...R, w: "#ffffff" },
            frames: [epistle, up(epistle), dots(up(epistle), "w", [[5, 6]]), dots(epistle, "w", [[5, 7]])] },
        favorites: { pal: { K: "#2a1a10", ...G, ...R, ...F }, frames: flick.map(b => put(lampada, 5, 1, b)) },
        unread: { pal: { a: "#fff2bf", b: "#f1cf6c", c: "#d7a43e", d: "#a8742a", k: "#3a2614", ...G, ...F, z: "#eef8ff", u: "#7cc0ff" },
            frames: cflick.map(b => put(candle, 5, 0, b)) },
        snoozed: { pal: { a: "#c58f55", b: "#8a5a32", c: "#5c3a1c", l: "#9cc4d0", m: "#cfe8f033", S: "#f8e0a0", T: "#e2b660", U: "#b8893a" },
            frames: [glass, dots(glass, "m", [[6, 7]]), dots(glass, "m", [[6, 8]]), dots(dots(glass, "m", [[6, 6]]), "S", [[5, 9], [7, 9]])] },
        archive: { pal: { ...G, ...R, e: "#d08a5a", f: "#a85f34", g: "#7a3e1c", h: "#4a220c", y: "#ffe9a0", W: "#fffbe8" },
            frames: [reliq, put(reliq, 0, 0, lid), put(put(reliq, 0, 0, lid), 0, 5, ["..WyWWWWWyW.."]), dots(reliq, "W", [[3, 3], [10, 2]])] },
        spam: { pal: { a: "#d39a5e", b: "#9a6234", c: "#62391a", r: "#d23a2e", s: "#8e1c18", S: "#fdeaa8", T: "#ecc65c", U: "#c8962f", V: "#8e6420", z: "#c8bca8" },
            frames: [broom, sweep(-1), dots(broom, "z", [[0, 12], [12, 12], [0, 11]]), sweep(1)] },
        ignored: { pal: { K: "#0e1a12", a: "#6cc48a", b: "#3e9a5e", c: "#287042", d: "#164626", i: "#c4c8d0", j: "#7c828c", k: "#454a52", m: "#6a625a", n: "#4a443e", y: "#ffd27a", W: "#fff2c0" },
            frames: [door, ajar1, ajar2, ajar1] },
        blocked: { pal: { A: "#ffffff", B: "#d6dde6", C: "#9aa4b2", D: "#5a6474", e: "#7aaeff", f: "#3a6ee0", g: "#2448a8", h: "#142a66", W: "#f4f8ff", X: "#b8c4d8" },
            frames: [shield, glint(3), glint(7), glint(11)] },
        head: { pal: { ...G, ...R }, frames: [cross, dots(cross, "A", [[4, 0]]), dots(cross, "A", [[1, 3], [4, 2]]), dots(cross, "A", [[3, 8]])] },
    };
})();
const ART = (() => {
    const G = PAL.gold, R = PAL.ruby, F = PAL.flame, pal = { K: "#2a1a10", ...G, ...R, ...F };
    // the great vigil lamp (lampada) hung before the icons: the people kept close
    const big = ["........B........", ".......B.C.......", "........C........", ".......D.D.......", "......C...C......", ".....D.gqg.D.....",
        "....C..gog..C....", "...D..goyog..D...", "..C..goywyog..C..", ".D...gywwwyg...D.", "C.....gywyg.....C", "KABBBBBBBBBBBCCDK",
        ".DCBCBCBCBCBCBCD.", ".thprruuurrrssst.", ".thprrruurrrsstt.", "..thprrrrrrsstt..", "..thrrrrrrrsstt..", "...thrrrrrrsst...",
        "....thrrrrsst....", ".....tsrrsst.....", "......ABBCD......", ".......DCD.......", "........C........", ".......ABC.......", "........D........"];
    const flames = [
        [" .gqg. ", "..gog..", ".goyog.", "goywyog", "gywwwyg", ".gywyg."],
        [" gq... ", ".gog...", ".goyog.", "goywyog", "gywwwyg", ".gywyg."],
        [" .gog. ", "..gyg..", ".goyog.", "goywyog", "gywwwyg", ".gywyg."],
        [" ...qg ", "...gog.", ".goyog.", "goywyog", "gywwwyg", ".gywyg."]];
    const lamp = ICON.favorites.frames, unlit = put(lamp[0], 5, 1, [" . ", "...", "...", "...", ".E."]);
    // the lampada that takes the place of Discord's grey star in the server bar: 16x16, drawn at 2x, ruby glass on gold chains
    const hang = [".......BC.......", "......B..D......", "......CBCD......", ".....C....D.....", "....D......C....", "...C........D...",
        "..D..........C..", ".C............D.", ".D............C.", "KABBBBBBBBBBCCDK", ".thprrrrrrrrsst.", ".thprruurrrrsst.", "..thrrrrrrrsst..",
        "...thrrrrrsst...", "....thrrrstt....", "......BCCD......"];
    const tongues = [
        ["      ", "  q   ", "  oo  ", " oyyo ", "gywwyg", "goyyog"],
        ["      ", "   q  ", "  oo  ", " oyyo ", "gywwyg", "goyyog"],
        ["   q  ", "  oo  ", " oyyo ", " ywwy ", "gywwyg", "goyyog"],
        ["      ", "      ", " qoo  ", " oyyo ", "gywwyg", "goyyog"]];
    return {
        guild: { pal, frames: tongues.map(b => put(hang, 5, 3, b)) },
        favorites: { pal, frames: flames.map((b, i) => put(i === 2 ? put(big, 8, 4, ["q"]) : big, 5, 5, b)) },
        // the small lamp of the "Keep in Favorites" button: dark, a spark, a small flame, then it burns (frames 3-6 flicker)
        lamp: { pal, frames: [unlit, put(unlit, 5, 1, [" . ", "...", "...", ".o.", ".y."]), put(unlit, 5, 1, [" . ", "...", ".o.", ".y.", "oyo"]), ...lamp] },
    };
})();
const GFAV = `body:not(.styledGuildsAsChannels_71509e) [data-list-item-id="guildsnav___favorites"]:not(#qi-n)`; // Discord's Favorites in the server bar
const EMPTY = { inbox: "Your inbox is empty.", favorites: "No one kept here yet. Open a conversation and press \u201cKeep in Favorites\u201d at the top, or right-click someone \u203a Inbox \u203a Favorite.",
    unread: "All caught up.", snoozed: "Nothing snoozed. Right-click a conversation \u203a Inbox \u203a Snooze to hide it until later.", archive: "Nothing archived.", spam: "No spam.", ignored: "No one ignored.", blocked: "No one blocked." };
const DEFAULTS = { hideBlocked: true, nonFriendsToSpam: false, silenceLive: true, archiveReturnsOnReply: true, focusMode: true, quietDMs: true, noDMBubbles: true, discordFavorites: true, liturgyQuiet: true, pinBubbles: true };

module.exports = class QuietInbox {
    static art = { ICON, ART, sheetSvg }; // for the art preview (tests/art-seraphim)
    constructor(meta) {
        this.name = meta?.name || "QuietInbox";
        this.tab = "inbox";
        this.version = 0;
        this.memo = new Map();
        this.lastAllIds = [];
        this.unsubs = [];
    }

    /* ---------- data ---------- */
    load() {
        const D = BdApi.Data;
        this.spam = new Set(D.load(this.name, "spam") || []);
        this.archive = new Set(D.load(this.name, "archive") || []);
        this.snooze = D.load(this.name, "snooze") || {};      // channel id -> time it comes back (ms)
        this.woke = D.load(this.name, "woke") || {};          // channel id -> time it came back (shown at the top for an hour)
        this.star = new Set(D.load(this.name, "star") || []);
        this.starMeta = D.load(this.name, "starMeta") || {};
        this.paneCollapsed = !!D.load(this.name, "pane");
        this.settings = Object.assign({}, DEFAULTS, D.load(this.name, "settings") || {});
    }
    save() {
        const D = BdApi.Data;
        D.save(this.name, "spam", [...this.spam]);
        D.save(this.name, "archive", [...this.archive]);
        D.save(this.name, "snooze", this.snooze || {});
        D.save(this.name, "woke", this.woke || {});
        D.save(this.name, "starMeta", this.starMeta || {});
        D.save(this.name, "star", [...this.star]);
        D.save(this.name, "settings", this.settings);
    }

    /* ---------- core logic (pure, tested) ---------- */
    recipientOf(ch) {
        if (!ch || ch.type !== 1) return null; // 1 = one-to-one DM
        return ch.getRecipientId?.() ?? ch.recipients?.[0] ?? ch.rawRecipients?.[0]?.id ?? null;
    }
    isHiddenUser(userId) {
        if (!userId) return false;
        const rs = this.RelationshipStore;
        if (rs?.isIgnored?.(userId)) return true;
        if (this.settings.hideBlocked && rs?.isBlocked?.(userId)) return true;
        return false;
    }
    folderOf(channelId) {
        const ch = this.ChannelStore?.getChannel?.(channelId);
        const rid = this.recipientOf(ch);
        const rs = this.RelationshipStore;
        if (rid && rs?.isIgnored?.(rid)) return "ignored";
        if (rid && this.settings.hideBlocked && rs?.isBlocked?.(rid)) return "blocked";
        if (this.spam.has(channelId)) return "spam";
        if (rid && this.settings.nonFriendsToSpam && !this.RelationshipStore?.isFriend?.(rid)
            && rid !== this.UserStore?.getCurrentUser?.()?.id) return "spam";
        if (this.archive.has(channelId)) return "archive";
        if (this.snooze?.[channelId] > Date.now()) return "snoozed";
        return "inbox";
    }
    isSpamChannel(channelId) {
        return !!channelId && this.isPrivate(channelId) && HIDDEN.has(this.folderOf(channelId));
    }
    isPrivate(channelId) {
        const ch = this.ChannelStore?.getChannel?.(channelId);
        return !!ch && (ch.type === 1 || ch.type === 3);
    }
    isUnread(channelId) { // real unread state (unpatched), for the folder counts
        const R = this.ReadStateStore, o = this.orig || {};
        try { return !!(o.hasUnread || R?.hasUnread)?.call(R, channelId) || ((o.getMentionCount || R?.getMentionCount)?.call(R, channelId) || 0) > 0; } catch (_) { return false; }
    }
    // outside the inbox a DM is silent: badges, the Home number and notifications only come from DMs in the main Inbox
    isQuiet(channelId) {
        if (!channelId || !this.isPrivate(channelId)) return false;
        const f = this.folderOf(channelId);
        return HIDDEN.has(f) || (this.settings.quietDMs && f !== "inbox");
    }
    isStar(channelId) {
        if (this.star.has(channelId)) return true;
        try { return !!(this.settings.discordFavorites && this.origIsFav?.(channelId)); } catch (_) { return false; }
    }
    /* the search box: a conversation matches when its name or a recipient's name contains the words (tested) */
    nameOf(channelId) {
        const ch = this.ChannelStore?.getChannel?.(channelId);
        const ids = ch?.recipients || ch?.rawRecipients?.map?.(u => u.id) || [];
        const names = ids.map(id => { const u = this.UserStore?.getUser?.(typeof id === "object" ? id.id : id); return [u?.globalName, u?.username].filter(Boolean).join(" "); });
        return [ch?.name, ...names].filter(Boolean).join(" ").toLowerCase();
    }
    matches(channelId) {
        const q = String(this.query || "").toLowerCase().trim();
        if (!q) return true;
        const n = this.nameOf(channelId);
        return q.split(/\s+/).every(w => n.includes(w));
    }
    visibleInTab(channelId, tab = this.tab) {
        if (this.query && !this.matches(channelId)) return false;
        const f = this.folderOf(channelId);
        if (tab === "favorites") return this.isStar(channelId) && !HIDDEN.has(f);
        if (tab === "unread") return !HIDDEN.has(f) && this.isUnread(channelId);
        return f === tab;
    }
    // favorites are pinned to the top of the Inbox (and Unread)
    pinFavorites(ids) {
        if (this.tab !== "inbox" && this.tab !== "unread") return ids;
        const now = Date.now(), up = id => this.isStar(id) ? 2 : (this.woke?.[id] > now - 36e5 ? 1 : 0);
        if (!ids.some(id => up(id))) return ids;
        return [...ids.filter(id => up(id) === 2), ...ids.filter(id => up(id) === 1), ...ids.filter(id => !up(id))];
    }
    idOf(item) {
        if (typeof item === "string") return item;
        return item?.channelId ?? item?.id ?? item?.channel?.id ?? null;
    }
    // filter with memo keyed on the original array, so React sees a stable array between changes
    filterList(key, arr, keep, post) {
        if (!Array.isArray(arr)) return arr;
        const m = this.memo.get(key);
        if (m && m.src === arr && m.v === this.version) return m.out;
        let out = arr.filter(x => keep(this.idOf(x)));
        if (post) out = post(out);
        this.memo.set(key, { src: arr, v: this.version, out });
        return out;
    }
    counts(ids = this.lastAllIds) {
        const total = Object.fromEntries(FOLDERS.map(f => [f, 0])), unread = { ...total };
        for (const id of ids) {
            const f = this.folderOf(id), hidden = HIDDEN.has(f), un = !hidden && this.isUnread(id);
            total[f]++;
            if (un) { unread[f]++; total.unread++; unread.unread++; }
            if (this.isStar(id) && !hidden) { total.favorites++; if (un) unread.favorites++; }
        }
        return { total, unread };
    }
    shouldBlockAction(a) {
        if (!this.settings.silenceLive || !a) return false;
        if (a.type !== "MESSAGE_CREATE" && a.type !== "TYPING_START") return false;
        const channelId = a.channelId ?? a.message?.channel_id ?? a.channel_id;
        if (channelId && channelId === this.SelectedChannelStore?.getChannelId?.()) return false; // you are reading it
        const authorId = a.message?.author?.id ?? a.userId ?? a.user_id;
        if (authorId && authorId === this.UserStore?.getCurrentUser?.()?.id) return false;
        const ch = this.ChannelStore?.getChannel?.(channelId);
        if (ch && ch.type !== 1 && ch.type !== 3) return false; // servers untouched
        if (!ch && a.message?.guild_id) return false;
        if (ch) return this.isSpamChannel(channelId);
        return this.isHiddenUser(authorId); // brand-new DM channel not in the store yet
    }

    /* ---------- lifecycle ---------- */
    start() {
        this.load();
        const W = BdApi.Webpack;
        this.ChannelStore = W.getStore("ChannelStore");
        this.UserStore = W.getStore("UserStore");
        this.RelationshipStore = W.getStore("RelationshipStore");
        this.SelectedChannelStore = W.getStore("SelectedChannelStore");
        this.SortStore = W.getStore("PrivateChannelSortStore");
        this.UnreadDMStore = W.getStore("PrivateChannelReadStateStore");
        this.ReadStateStore = W.getStore("ReadStateStore");
        this.FavoriteStore = W.getStore("FavoriteStore") || W.getStore("ChannelFavoritesStore");
        this.origIsFav = typeof this.FavoriteStore?.isFavorite === "function" ? this.FavoriteStore.isFavorite.bind(this.FavoriteStore) : null;
        this.Dispatcher = this.UserStore?._dispatcher;

        this.patchStores();
        this.patchNotifications(); this.hookGuildFavorites();
        this.addInterceptor();
        this.patchMenus();

        this.onRelChange = () => this.refresh();
        this.RelationshipStore?.addChangeListener?.(this.onRelChange);
        // read state changes: counts and the Unread folder follow (debounced; ignores the plugin's own emits)
        this.onRead = () => { if (this.emitting) return; clearTimeout(this.readT); this.readT = setTimeout(() => { if (!this.stopped) this.refresh(); }, 600); };
        this.ReadStateStore?.addChangeListener?.(this.onRead);
        // presence: the status dot after each name and on pinned people in the server bar (throttled)
        this.PresenceStore = W.getStore("PresenceStore");
        this.onPresence = () => { if (this.presT) return; this.presT = setTimeout(() => { this.presT = null; if (!this.stopped) try { this.writeStatusCss(); } catch (_) {} }, 1000); };
        this.PresenceStore?.addChangeListener?.(this.onPresence);
        this.onMessage = a => this.onMessageCreate(a);
        this.Dispatcher?.subscribe?.("MESSAGE_CREATE", this.onMessage);

        this.stopped = false;
        this.mountBar();
        this.wake();
        this.refresh();
        globalThis.__cl3arLiturgy = () => this.liturgyNow();
        this.wakeTimer = setInterval(() => { try { this.wake(); } catch (_) {} }, 30000);

        // focus mode: an open DM fills the window, other DMs and servers are out of sight
        this.Router = BdApi.Webpack.getByKeys?.("transitionTo", "replaceWith") || BdApi.Webpack.getModule?.(BdApi.Webpack.Filters.byKeys("transitionTo"));
        this.onSelect = () => this.updateFocus();
        this.SelectedChannelStore?.addChangeListener?.(this.onSelect);
        this.updateFocus();
    }

    focusCss() {
        return `
body.qi-focus nav[class*="guilds"],
body.qi-focus [class*="sidebar_"]:has(nav[class*="privateChannels"]){display:none!important}
body.qi-focus :is(section[class*="title_"],div[class*="bar_"] > div[class*="title_"]){padding-left:92px!important}
#qi-back{position:fixed;z-index:1000;left:10px;top:calc(var(--custom-app-top-bar-height,24px) + 10px);height:28px;padding:0 12px;
 border:1px solid rgba(255,255,255,.18);background:#1e1e1e;color:#e8e8e8;font:600 13px var(--nx-font,inherit);cursor:pointer}
#qi-back:hover{background:#2c2c2c;color:#fff}
body:not(.qi-focus) #qi-back{display:none}`;
    }
    inFocus() {
        const id = this.SelectedChannelStore?.getChannelId?.();
        return !!this.settings.focusMode && !!id && this.isPrivate(id);
    }
    updateFocus() {
        const on = this.inFocus();
        document.body.classList.toggle("qi-focus", on);
        if (on && !document.getElementById("qi-back")) {
            const b = document.createElement("button");
            b.id = "qi-back";
            b.textContent = "‹ Inbox";
            b.addEventListener("click", () => this.goInbox());
            document.body.appendChild(b);
        }
        let fb = document.getElementById("qi-fav");
        if (on && !fb) {
            fb = document.createElement("button");
            fb.id = "qi-fav"; fb.type = "button";
            fb.addEventListener("click", () => { const id = this.SelectedChannelStore?.getChannelId?.(); if (id && (this.star.has(id) || !this.isStar(id))) this.setStar(id, !this.star.has(id)); });
            document.body.appendChild(fb);
        }
        if (fb) try {
            const id = this.SelectedChannelStore?.getChannelId?.(), kept = !!id && this.isStar(id);
            const prev = document.getElementById("cl3ar-full") || document.getElementById("qi-back"); // after "‹ Inbox" and the full-screen icon
            const pr = prev?.getBoundingClientRect?.();
            fb.style.left = (pr && pr.width ? Math.round(pr.right) + 6 : 136) + "px";
            if (fb.dataset.kept !== String(kept)) { fb.dataset.kept = String(kept); fb.className = kept ? "on" : ""; fb.innerHTML = "<i></i>"; fb.title = kept ? (this.star.has(id) ? "Kept in Favorites (click to remove)" : "In Discord's Favorites (remove it there)") : "Keep in Favorites"; fb.setAttribute("aria-label", fb.title); }
        } catch (_) {}
    }
    goInbox() {
        try { if (this.Router?.transitionTo) return this.Router.transitionTo("/channels/@me"); } catch (_) {}
        history.pushState({}, "", "/channels/@me");
        dispatchEvent(new PopStateEvent("popstate"));
    }

    stop() {
        this.stopped = true;
        clearInterval(this.wakeTimer); clearTimeout(this.probeT); clearTimeout(this.searchT); clearTimeout(this.swapT); delete globalThis.__cl3arLiturgy;
        try { document.querySelectorAll("nav.qi-swap").forEach(n => n.classList.remove("qi-swap")); } catch (_) {}
        BdApi.Patcher.unpatchAll(this.name);
        for (const u of this.unsubs) try { u(); } catch (_) {}
        this.unsubs = [];
        const ic = this.Dispatcher?._interceptors;
        if (ic && this.interceptor) { const i = ic.indexOf(this.interceptor); if (i >= 0) ic.splice(i, 1); }
        this.RelationshipStore?.removeChangeListener?.(this.onRelChange);
        this.ReadStateStore?.removeChangeListener?.(this.onRead); clearTimeout(this.readT);
        this.PresenceStore?.removeChangeListener?.(this.onPresence); clearTimeout(this.presT); this.presT = null;
        BdApi.DOM.removeStyle(this.name + "-status"); this.lastStatus = null;
        this.Dispatcher?.unsubscribe?.("MESSAGE_CREATE", this.onMessage);
        this.barObserver?.disconnect();
        this.SelectedChannelStore?.removeChangeListener?.(this.onSelect);
        document.body.classList.remove("qi-focus");
        document.getElementById("qi-back")?.remove();
        document.getElementById("qi-fav")?.remove();
        document.getElementById("quietinbox-bar")?.remove();
        BdApi.DOM.removeStyle(this.name);
        BdApi.DOM.removeStyle(this.name + "-net"); this.lastNet = null;
        this.memo.clear();
        this.emit();
    }

    /* ---------- patches ---------- */
    patchStores() {
        const P = BdApi.Patcher;
        if (this.SortStore?.getPrivateChannelIds) {
            P.after(this.name, this.SortStore, "getPrivateChannelIds", (_, __, res) => {
                if (Array.isArray(res)) this.lastAllIds = res;
                return this.filterList("ids", res, id => this.visibleInTab(id), ids => this.pinFavorites(ids));
            });
        }
        if (this.SortStore?.getSortedChannels) {
            P.after(this.name, this.SortStore, "getSortedChannels", (_, __, res) => {
                if (!Array.isArray(res)) return res;
                const m = this.memo.get("sorted");
                if (m && m.v === this.version && m.src.length === res.length && m.src.every((s, i) => s === res[i])) return m.out;
                const out = res.map((sec, i) => this.filterList("sorted" + i, sec, id => this.visibleInTab(id)));
                this.memo.set("sorted", { src: res.slice(), v: this.version, out });
                return out;
            });
        }
        // Discord's own Favorites: spam DMs never listed there either
        if (this.FavoriteStore?.getFavoriteChannels) {
            P.after(this.name, this.FavoriteStore, "getFavoriteChannels", (_, __, res) => {
                if (!res || typeof res !== "object") return res;
                const m = this.memo.get("fav");
                if (m && m.src === res && m.v === this.version) return m.out;
                let out = res;
                if (Array.isArray(res)) out = this.filterList("favArr", res, id => !this.isSpamChannel(id));
                else {
                    const keys = Object.keys(res).filter(k => this.isSpamChannel(res[k]?.id ?? k));
                    if (keys.length) { out = { ...res }; for (const k of keys) delete out[k]; }
                }
                this.memo.set("fav", { src: res, v: this.version, out });
                return out;
            });
        }
        if (typeof this.FavoriteStore?.isFavorite === "function")
            P.after(this.name, this.FavoriteStore, "isFavorite", (_, args, res) => res && !this.isSpamChannel(args[0]));
        // server bar: no DM bubbles at all (DMs live in the inbox); if turned off, never for spam/ignored/blocked
        if (this.UnreadDMStore?.getUnreadPrivateChannelIds) {
            P.after(this.name, this.UnreadDMStore, "getUnreadPrivateChannelIds", (_, __, res) =>
                this.filterList("unread", res, id => !this.settings.noDMBubbles && !this.isQuiet(id), ids => this.withPinned(ids)));
        }
        // badges and the Home number: only DMs in the main Inbox count (local only; nothing is marked read on the server)
        if (this.ReadStateStore) {
            this.orig = {};
            for (const m of ["getMentionCount", "getUnreadCount", "hasUnread"]) {
                if (typeof this.ReadStateStore[m] !== "function") continue;
                this.orig[m] = this.ReadStateStore[m];
                P.after(this.name, this.ReadStateStore, m, (_, args, res) => this.isQuiet(args[0]) ? (m === "hasUnread" ? false : 0) : res);
            }
        }
    }

    /* the lampada in the server bar opens our Favorites folder (Discord's own Favorites page is a different, usually empty, list) (tested) */
    hookGuildFavorites() {
        const onClick = e => {
            if (this.stopped || e.button !== 0 || !e.target?.closest?.('[data-list-item-id="guildsnav___favorites"]')) return;
            if (document.body.classList.contains("styledGuildsAsChannels_71509e")) return; // the text server list keeps Discord's own
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
            this.openFavorites();
        };
        document.addEventListener?.("click", onClick, true); // capture: runs before Discord's own handler
        this.unsubs.push(() => document.removeEventListener?.("click", onClick, true));
    }
    openFavorites() {
        const changed = this.tab !== "favorites";
        if (changed) this.enterTab = "favorites";
        this.tab = "favorites";
        if (!location.pathname.startsWith("/channels/@me")) this.goInbox();
        this.refresh();
        const bar = document.getElementById("quietinbox-bar");
        if (changed && bar) this.swapIn(bar);
    }
    patchNotifications() {
        const F = BdApi.Webpack.Filters;
        const ctl = new AbortController();
        this.unsubs.push(() => ctl.abort());
        BdApi.Webpack.waitForModule(F.byKeys("showNotification", "requestPermission"), { signal: ctl.signal }).then(mod => {
            if (!mod) return;
            BdApi.Patcher.instead(this.name, mod, "showNotification", (_, args, orig) => {
                const info = args[3] || {};
                const ch = info.channel_id ?? info.channel?.id;
                const user = info.notif_user_id ?? info.message?.author?.id;
                if ((ch && this.isQuiet(ch)) || (this.isPrivateOrUnknown(ch) && this.isHiddenUser(user))) return;
                if (this.isPrivateOrUnknown(ch) && this.liturgyNow()) return;                 // Liturgy quiet
                return orig(...args);
            });
        }).catch(() => {});
    }
    isPrivateOrUnknown(ch) { return !ch || this.isPrivate(ch); }
    /* Sunday and great-feast mornings (8 am to noon): time for the Divine Liturgy (tested) */
    static inLiturgy(now = new Date(), cal = (() => { try { return globalThis.BdApi?.Data?.load?.("Cl3ar_orthodox_discord", "home.settings")?.calendar; } catch (_) { return undefined; } })()) {
        const h = now.getHours(); if (h < 8 || h >= 12) return false;
        if (now.getDay() === 0) return true;
        const y = now.getFullYear(), d0 = new Date(y, now.getMonth(), now.getDate()).getTime(), J = (m, d) => new Date(y, m - 1, d + (cal === "new" ? 0 : 13)).getTime(); // fixed feasts follow the Old or New calendar setting
        const a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7, m = Math.floor((d + e + 114) / 31), P = new Date(y, m - 1, ((d + e + 114) % 31) + 1 + 13);
        const pd = n => new Date(P.getFullYear(), P.getMonth(), P.getDate() + n).getTime();
        return [J(1, 6), J(2, 2), J(3, 25), J(8, 6), J(8, 15), J(9, 8), J(9, 14), J(11, 21), J(12, 25), new Date(y, 0, 7).getTime(), pd(-7), pd(39), pd(49)].includes(d0);
    }
    liturgyNow() { return !!this.settings.liturgyQuiet && QuietInbox.inLiturgy(); }

    addInterceptor() {
        const ic = this.Dispatcher?._interceptors;
        if (!Array.isArray(ic)) return;
        this.interceptor = a => { try { return this.shouldBlockAction(a); } catch (_) { return false; } };
        ic.unshift(this.interceptor);
    }

    onMessageCreate({ message } = {}) {
        // email behaviour: a new reply moves an archived chat back to the inbox
        if (!this.settings.archiveReturnsOnReply || !message) return;
        const id = message.channel_id;
        if (!this.archive.has(id) || message.author?.id === this.UserStore?.getCurrentUser?.()?.id) return;
        if (this.folderOf(id) !== "archive") return;
        this.archive.delete(id);
        this.save();
        this.refresh();
    }

    setStar(id, on, user) {
        if (on) {
            this.star.add(id); this.lit = true; // the Favorites lamp catches on the next render

            const ch = this.ChannelStore?.getChannel?.(id), uid = user?.id || this.recipientOf(ch);
            const u = uid && this.UserStore?.getUser?.(uid);
            this.starMeta[id] = { uid: uid || null, name: ch?.name || u?.globalName || u?.username || user?.username || "Conversation" };
        } else { this.star.delete(id); delete this.starMeta[id]; }
        this.save(); this.refresh(); this.updateFocus();
    }
    /* open a conversation, even one closed in the DM list */
    openChannel(id) {
        const uid = this.starMeta[id]?.uid || this.recipientOf(this.ChannelStore?.getChannel?.(id));
        try { const A = BdApi.Webpack.getByKeys?.("openPrivateChannel"); if (uid && A?.openPrivateChannel) return A.openPrivateChannel(uid); } catch (_) {}
        try { if (this.Router?.transitionTo) return this.Router.transitionTo("/channels/@me/" + id); } catch (_) {}
        history.pushState({}, "", "/channels/@me/" + id); dispatchEvent(new PopStateEvent("popstate"));
    }
    probe(tab) { // what Favorites saw, for when it looks empty
        try {
            const nav = document.querySelector('nav[class*="privateChannels"]');
            const rows = nav ? [...nav.querySelectorAll('a[href^="/channels/@me/"]')].map(a => a.getAttribute("href").split("/").pop()) : null;
            BdApi.Data.save(this.name, "probe", { at: new Date().toISOString(), tab, all: this.lastAllIds.length,
                visible: this.lastAllIds.filter(id => this.visibleInTab(id)).length, rows,
                stars: [...this.star].map(id => ({ id, inList: this.lastAllIds.includes(id), known: !!this.ChannelStore?.getChannel?.(id), folder: this.folderOf(id), vis: this.visibleInTab(id, "favorites") })) });
        } catch (e) { BdApi.Data.save(this.name, "probe", { error: String(e) }); }
    }

    setSnooze(id, until) {
        if (until) { this.snooze[id] = until; this.archive.delete(id); } else delete this.snooze[id];
        delete this.woke[id];
        this.save(); this.refresh();
    }
    wake(now = Date.now()) {
        let changed = false;
        for (const [id, t] of Object.entries(this.snooze)) if (t <= now) { delete this.snooze[id]; this.woke[id] = now; changed = true; }
        for (const [id, t] of Object.entries(this.woke)) if (t < now - 36e5) { delete this.woke[id]; changed = true; }
        if (changed) { this.save(); this.refresh(); }
        return changed;
    }
    static snoozeTimes(now = new Date()) {
        const at = (dayOffset, h) => { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h); return d.getTime(); };
        const tonight = now.getHours() < 19 ? at(0, 20) : null;
        const monday = at(((8 - now.getDay()) % 7) || 7, 8);
        return [["For an hour", now.getTime() + 36e5], ...(tonight ? [["Until this evening (8 pm)", tonight]] : []), ["Until tomorrow morning (8 am)", at(1, 8)], ["Until next week (Monday 8 am)", monday]];
    }

    /* ---------- menus ---------- */
    dmChannelFor(props) {
        if (props.channel && (props.channel.type === 1 || props.channel.type === 3)) return props.channel.id;
        const uid = props.user?.id;
        return uid ? this.ChannelStore?.getDMFromUserId?.(uid) ?? null : null;
    }
    patchMenus() {
        const build = (tree, props) => {
            const id = this.dmChannelFor(props || {});
            const kids = tree?.props?.children;
            if (!id || !Array.isArray(kids)) return;
            const f = this.folderOf(id), forced = f === "ignored" || f === "blocked";
            const spam = this.spam.has(id) || forced;
            const toggle = (set, on) => { on ? set.add(id) : set.delete(id); this.save(); this.refresh(); };
            const items = [
                { type: "toggle", label: this.isStar(id) && !this.star.has(id) ? "Favorite (from Discord's Favorites)" : "Favorite (pin to top)", checked: this.isStar(id), disabled: forced || (this.isStar(id) && !this.star.has(id)),
                  action: () => this.setStar(id, !this.star.has(id), props?.user) },
                this.snooze[id] > Date.now()
                    ? { type: "text", label: `Wake now (snoozed until ${new Date(this.snooze[id]).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })})`, action: () => this.setSnooze(id, 0) }
                    : { type: "submenu", label: "Snooze", disabled: spam, items: QuietInbox.snoozeTimes().map(([label, t]) => ({ type: "text", label, action: () => this.setSnooze(id, t) })) },
                { type: "text", label: this.archive.has(id) ? "Move to Inbox" : "Archive",
                  disabled: spam, action: () => toggle(this.archive, !this.archive.has(id)) },
                { type: "text", label: forced ? `In ${LABELS[f]} (change it in Discord)` : spam ? "Not spam" : "Mark as spam",
                  disabled: forced, action: () => { if (!spam) this.archive.delete(id); toggle(this.spam, !spam); } },
            ];
            kids.push(BdApi.ContextMenu.buildItem({ type: "separator" }),
                BdApi.ContextMenu.buildItem({ type: "submenu", label: "Inbox", items }));
        };
        this.unsubs.push(BdApi.ContextMenu.patch("user-context", build), BdApi.ContextMenu.patch("gdm-context", build));
    }

    /* ---------- refresh + UI ---------- */
    emit(only) {
        this.emitting = true;
        try { for (const s of only || [this.SortStore, this.UnreadDMStore, this.ReadStateStore, this.FavoriteStore]) try { s?.emitChange?.(); } catch (_) {} }
        finally { this.emitting = false; }
    }
    /* a search edit only needs the DM list to recompute */
    /* pinned (favourite) people stay in the server bar as Discord's own DM bubble: their picture, and the status dot from statusCss (tested) */
    withPinned(ids) {
        if (!this.settings.pinBubbles) return ids;
        const have = new Set(ids.map(x => this.idOf(x)));
        const pins = [...this.star].filter(id => {
            if (have.has(id)) return false;
            const ch = this.ChannelStore?.getChannel?.(id), uid = this.recipientOf(ch);
            return !!uid && !this.isHiddenUser(uid) && !this.isSpamChannel(id);
        });
        return pins.length ? [...pins, ...ids] : ids;
    }
    /* each name in the DM list ends with its status; pinned people in the server bar get the same dot (tested) */
    statusCss() {
        const P = this.PresenceStore; if (!P?.getStatus) return "";
        const COL = { online: "#3ba55d", idle: "#f0b232", dnd: "#e5484d", streaming: "#9b59d6" };
        const DM = '[class*="privateChannels"]', BAR = 'body:not(.styledGuildsAsChannels_71509e) nav[class*="guilds"]', out = [];
        const ids = new Set([...(this.lastAllIds.length ? this.lastAllIds : this.domIds()), ...this.star]);
        for (const cid of ids) {
            const uid = this.recipientOf(this.ChannelStore?.getChannel?.(cid));
            if (!uid || !/^\d+$/.test(String(cid)) || !/^\d+$/.test(String(uid))) continue;
            const c = COL[P.getStatus(uid)], dot = c ? `background:${c}` : "background:transparent;box-shadow:inset 0 0 0 2px #7a7c84";
            out.push(`${DM} li:has(a[href="/channels/@me/${cid}"]) [class*="nameAndDecorators"]::after{content:"";flex:none;display:inline-block;width:8px;height:8px;margin-left:7px;border-radius:50%;align-self:center;${dot}}`);
            if (this.settings.pinBubbles && this.star.has(cid))
                out.push(`${BAR} :is([data-list-item-id^="guildsnav___"],[class*="listItem_"]):has(img[src*="/avatars/${uid}/"]){position:relative}
${BAR} :is([data-list-item-id^="guildsnav___"],[class*="listItem_"]):has(img[src*="/avatars/${uid}/"])::before{content:"";position:absolute;right:6px;bottom:2px;width:10px;height:10px;border-radius:50%;z-index:3;border:3px solid #141312;${dot}}`);
        }
        return out.join("\n");
    }
    writeStatusCss() {
        const css = this.statusCss();
        if (css === this.lastStatus) return;
        this.lastStatus = css;
        BdApi.DOM.addStyle(this.name + "-status", css);
    }
    refreshList() { this.version++; this.memo.clear(); this.writeNetCss(); try { this.writeStatusCss(); } catch (_) {} this.emit([this.SortStore]); this.renderBar(); }
    publishPinned() {
        const ids = [];
        for (const cid of new Set([...this.star, ...this.lastAllIds.filter(id => this.isStar(id))])) { const r = this.recipientOf(this.ChannelStore?.getChannel?.(cid)); if (r && !this.isHiddenUser(r)) ids.push(r); }
        globalThis.__cl3arPinned = ids;
        dispatchEvent(new CustomEvent("cl3ar:pinned"));
    }
    refresh() {
        this.version++;
        try { this.publishPinned(); } catch (_) {}
        this.memo.clear();
        try { this.SortStore?.getPrivateChannelIds?.(); } catch (_) {} // fills lastAllIds for counts + CSS net
        this.writeNetCss();
        this.emit();
        this.renderBar();
    }

    // Safety net painted by CSS before any frame: rows of ignored/blocked/spam DMs are hidden even if a store patch ever misses.
    // Safety net painted by CSS: whatever Discord's list does with the store patch, a folder shows only its own conversations.
    writeNetCss() {
        const DM = '[class*="privateChannels"]', row = id => `${DM} li:has(a[href="/channels/@me/${id}"])`;
        const ids = this.lastAllIds.length ? this.lastAllIds : this.domIds();
        const sel = [];
        if ((this.tab !== "inbox" && this.tab !== "unread") || this.query) {
            const keep = ids.filter(id => this.visibleInTab(id)).map(id => `:not(:has(a[href="/channels/@me/${id}"]))`).join("");
            sel.push(`${DM} li:has(a[href^="/channels/@me/"])${keep}`);
        } else {
            const users = new Set();
            for (const id of ids) {
                if (this.visibleInTab(id)) continue;
                sel.push(row(id));
                if (HIDDEN.has(this.folderOf(id))) { const r = this.recipientOf(this.ChannelStore?.getChannel?.(id)); if (r) users.add(r); }
            }
            for (const id of this.spam) sel.push(row(id));
            for (const u of this.RelationshipStore?.getIgnoredIDs?.() || []) users.add(u);
            if (this.settings.hideBlocked) for (const u of this.RelationshipStore?.getBlockedIDs?.() || []) users.add(u);
            for (const u of users) sel.push(`${DM} li:has(img[src*="/avatars/${u}/"])`);
        }
        const css = [...new Set(sel)].join(", ");
        if (css === this.lastNet) return;
        this.lastNet = css;
        BdApi.DOM.removeStyle(this.name + "-net");
        if (css) BdApi.DOM.addStyle(this.name + "-net", css + "{display:none!important}");
    }
    domIds() {
        try { return [...document.querySelectorAll('[class*="privateChannels"] a[href^="/channels/@me/"]')].map(a => a.getAttribute("href").split("/").pop()).filter(id => /^\d+$/.test(id)); } catch (_) { return []; }
    }

    mountBar() {
        BdApi.DOM.addStyle(this.name, `
#quietinbox-bar{padding:4px 6px 6px;border-bottom:1px solid rgba(255,255,255,.08);user-select:none}
#quietinbox-bar .qi-head{display:flex;align-items:center;gap:6px;height:30px;padding:0 6px;cursor:pointer;
 font:700 11px var(--nx-font,inherit);letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted,#999)}
#quietinbox-bar .qi-head:hover{color:var(--interactive-hover,#fff)}
#quietinbox-bar .qi-head .qi-cur{margin-left:auto;text-transform:none;letter-spacing:0;font-weight:600;color:var(--text-normal,#ddd)}
#quietinbox-bar .qi-f{position:relative;display:flex;align-items:center;gap:8px;height:32px;padding:0 8px 0 12px;cursor:pointer;border-radius:0;
 font:500 13px var(--nx-font,inherit);color:var(--channels-default,#bbb);transition:background .14s ease,color .14s ease}
#quietinbox-bar .qi-f:hover{background:linear-gradient(90deg,rgba(201,162,74,.12),rgba(201,162,74,0) 80%);color:#f3ead6}
#quietinbox-bar .qi-f .qi-l{transition:transform .16s steps(2,end)}
#quietinbox-bar .qi-f:hover .qi-l{transform:translateX(2px)}
#quietinbox-bar .qi-f:active{background:rgba(201,162,74,.2)}
#quietinbox-bar .qi-f.qi-on{background:linear-gradient(90deg,rgba(201,162,74,.26),rgba(201,162,74,.04) 85%);color:#f1d27a;box-shadow:inset 2px 0 0 #d4b062}
#quietinbox-bar .qi-ic,#quietinbox-bar .qi-art-s,#quietinbox-bar .qi-art-fav,#quietinbox-bar .qi-lamp,#qi-fav i{--fw:13px;background-repeat:no-repeat;background-position:0 0;background-size:400% 100%;image-rendering:pixelated}
/* every picture at a clean 2x (13px art -> 26px), full colour and full strength whether chosen or not */
#quietinbox-bar .qi-ic{--fw:26px;flex:none;width:26px;height:26px;opacity:1}
#quietinbox-bar .qi-f.qi-on .qi-ic{transform:translateY(-2px)}
#quietinbox-bar .qi-head .qi-ic{--fw:18px;width:18px;height:26px}
#quietinbox-bar .qi-tw{display:inline-block;width:8px}
${Object.keys(ICON).map(k => `#quietinbox-bar .qi-ic-${k},#quietinbox-bar .qi-art-${k}{background-image:${sheet(ICON[k])}}`).join("\n")}
@keyframes qiRun{from{background-position:0 0}to{background-position:calc(var(--fw) * -3) 0}}
@keyframes qiBurn{from{background-position:calc(var(--fw) * -3) 0}to{background-position:calc(var(--fw) * -6) 0}}
@keyframes qiLift{0%{transform:none}33%{transform:translateY(-2px)}66%{transform:translateY(-4px)}100%{transform:translateY(-2px)}}
@keyframes qiFlip{0%{transform:rotate(180deg)}50%{transform:rotate(90deg)}100%{transform:translateY(-2px)}}
@keyframes qiCatch{0%,100%{filter:none}50%{filter:brightness(1.5) drop-shadow(0 0 3px #ffb43a)}}
@keyframes qiHalo{from{filter:drop-shadow(0 0 3px rgba(255,170,60,.28))}to{filter:drop-shadow(0 0 7px rgba(255,170,60,.5))}}
@keyframes qiIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@keyframes qiRowIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
/* hover: each picture does its own small thing (the candle flickers, the sand runs, the door creaks, the broom sweeps) */
#quietinbox-bar .qi-ic-unread{--qd:.6s} #quietinbox-bar .qi-ic-snoozed,#quietinbox-bar .qi-ic-blocked{--qd:1s} #quietinbox-bar .qi-ic-archive,#quietinbox-bar .qi-ic-ignored{--qd:1.2s}
#quietinbox-bar .qi-f:hover .qi-ic{animation:qiRun var(--qd,.8s) steps(4,jump-none) infinite}
#quietinbox-bar .qi-head:hover .qi-ic{animation:qiRun 1s steps(4,jump-none) infinite}
/* the chosen folder: its icon lifts; lamp and candle stay lit and glow */
#quietinbox-bar .qi-f.qi-on .qi-ic-favorites,#quietinbox-bar .qi-f.qi-on .qi-ic-unread{animation:qiRun .9s steps(4,jump-none) infinite;filter:drop-shadow(0 0 2px rgba(255,170,60,.6))}
#quietinbox-bar .qi-f.qi-enter .qi-ic{animation:qiLift .3s steps(1,end),qiRun .4s steps(4,jump-none)}
#quietinbox-bar .qi-f.qi-enter .qi-ic-snoozed{animation:qiFlip .3s steps(1,end),qiRun .4s steps(4,jump-none) .3s}
#quietinbox-bar .qi-f.qi-enter .qi-ic-favorites,#quietinbox-bar .qi-f.qi-enter .qi-ic-unread{animation:qiLift .3s steps(1,end),qiRun .9s steps(4,jump-none) infinite}
#quietinbox-bar .qi-f.qi-lit .qi-ic-favorites{animation:qiLift .3s steps(1,end),qiCatch .4s steps(2,end),qiRun .9s steps(4,jump-none) infinite}
/* a new folder: the list steps in, a pixel at a time */
nav.qi-swap li:has(a[href^="/channels/@me/"]),nav.qi-swap #quietinbox-bar .qi-empty,nav.qi-swap #quietinbox-bar .qi-open{animation:qiRowIn .24s steps(3,end) backwards}
nav.qi-swap #quietinbox-bar .qi-empty{animation-name:qiIn}
${[2, 3, 4, 5, 6, 7, 8].map(i => `nav.qi-swap li:has(a[href^="/channels/@me/"]):nth-child(${i}){animation-delay:${(i - 1) * 25}ms}`).join("\n")}
#quietinbox-bar .qi-art-s{--fw:52px;width:52px;height:52px}
#quietinbox-bar .qi-art-unread{animation:qiRun 1s steps(4,jump-none) infinite}
#quietinbox-bar .qi-art-snoozed{animation:qiRun 1.6s steps(4,jump-none) infinite}
#quietinbox-bar .qi-art-fav{--fw:68px;width:68px;height:100px;background-image:${sheet(ART.favorites)};animation:qiRun 1s steps(4,jump-none) infinite,qiHalo 2.4s ease-in-out infinite alternate}
@media (prefers-reduced-motion:reduce){#quietinbox-bar *,#qi-fav,#qi-fav *,nav.qi-swap li{animation:none!important;transition:none!important}}
#quietinbox-bar .qi-l{flex:1}
#quietinbox-bar .qi-n{font-size:12px;opacity:.6}
#quietinbox-bar .qi-n.u{opacity:1;font-weight:700;color:var(--text-strong,#fff)}
#quietinbox-bar .qi-f:focus-visible,#qi-back:focus-visible,#qi-fav:focus-visible{outline:2px solid #f1d27a!important;outline-offset:1px}
#quietinbox-bar .qi-search{position:relative;margin:6px 6px 2px}
#quietinbox-bar .qi-search input{width:100%;box-sizing:border-box;height:26px;padding:0 24px 0 9px;font:13px var(--nx-font,inherit);color:var(--text-normal,#ddd);
 background:rgba(0,0,0,.4);border:1px solid rgba(201,162,74,.22);outline:none;transition:border-color .14s ease,background .14s ease}
#quietinbox-bar .qi-search input:focus{border-color:#d4b062;background:rgba(0,0,0,.55)}
#quietinbox-bar .qi-search input::placeholder{color:var(--text-muted,#888)}
#quietinbox-bar .qi-x{position:absolute;right:3px;top:3px;width:20px;height:20px;padding:0;border:0;background:none;color:var(--text-muted,#999);cursor:pointer;display:none}
#quietinbox-bar.qi-q .qi-x{display:block} #quietinbox-bar .qi-x:hover{color:#f1d27a}
#quietinbox-bar .qi-sep{height:1px;margin:4px 8px;background:rgba(255,255,255,.08)}
#quietinbox-bar .qi-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 10px 8px;text-align:center}
#quietinbox-bar .qi-art{flex:none}
/* a vigil lamp burns by every person kept close, each flickering in its own time */
#quietinbox-bar .qi-lamp{--fw:26px;display:inline-block;flex:none;width:26px;height:26px;background-image:${sheet(ICON.favorites)};
 animation:qiRun .9s steps(4,jump-none) infinite;filter:drop-shadow(0 0 2px rgba(255,170,60,.5))}
#quietinbox-bar .qi-open:nth-of-type(2n) .qi-lamp{animation-duration:1.1s;animation-delay:-.3s}
#quietinbox-bar .qi-open:nth-of-type(3n) .qi-lamp{animation-duration:.8s;animation-delay:-.5s}
#qi-fav{position:fixed;z-index:1000;left:136px;top:calc(var(--custom-app-top-bar-height,24px) + 10px);width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;
 border:1px solid rgba(201,162,74,.4);background:#1e1e1e;cursor:pointer;transition:border-color .2s ease,box-shadow .3s ease}
#qi-fav i{--fw:26px;width:26px;height:26px;background-image:${sheet(ART.lamp)};background-size:700% 100%}
#qi-fav.on{border-color:#c9a24a;box-shadow:0 0 8px rgba(255,180,58,.4)}
#qi-fav.on i{opacity:1;filter:drop-shadow(0 0 3px rgba(255,170,60,.55));background-position:calc(var(--fw) * -3) 0;animation:qiRun .32s steps(4,jump-none),qiBurn .9s steps(4,jump-none) .32s infinite}
#qi-fav:hover{background:#2c2c2c}
body:not(.qi-focus) #qi-fav{display:none}
/* Discord's own Favorites in the server bar (guildsnav___favorites): its grey star gives way to a burning lampada at 2x.
   The click stays Discord's (only a picture on top, pointer-events none); if Discord renames the item the star simply comes back.
   :not(#qi-n) outweighs the theme's box colour and its motion stop; not in the text server list (servers.js) */
${GFAV}{position:relative;background:radial-gradient(circle at 50% 60%,#6a2a16 0,#3a1a0e 45%,#1c0f08 100%)!important}
${GFAV} svg{opacity:0!important}
${GFAV}::after{content:"";position:absolute;inset:0;margin:auto;width:32px;height:32px;pointer-events:none;z-index:2;--fw:32px;
 background:${sheet(ART.guild)} 0 0/400% 100% no-repeat;image-rendering:pixelated;
 animation:qiRun 1s steps(4,jump-none) infinite!important;filter:drop-shadow(0 0 3px rgba(255,170,60,.45))}
${GFAV}:hover::after{animation-duration:.6s!important;filter:drop-shadow(0 0 5px rgba(255,180,70,.75))}
@media (prefers-reduced-motion:reduce){${GFAV}::after{animation:none!important}}
#quietinbox-bar .qi-hint{font:500 12px/1.45 var(--nx-font,inherit);color:var(--text-muted,#999);max-width:240px}` + this.focusCss());
        const ensure = () => {
            const nav = document.querySelector('nav[class*="privateChannels"]');
            if (!nav || nav.querySelector("#quietinbox-bar")) return;
            const scroller = nav.querySelector('[class*="scroller"]');
            const bar = document.createElement("div");
            bar.id = "quietinbox-bar";
            bar.innerHTML = `<div class="qi-body"></div><div class="qi-search"><input type="text" placeholder="Search conversations" spellcheck="false" aria-label="Search conversations"><button type="button" class="qi-x" title="Clear">×</button></div>`;
            const inp = bar.querySelector(".qi-search input");
            inp.value = this.query || "";
            bar.classList.toggle("qi-q", !!this.query);
            inp.addEventListener("input", () => {
                this.query = inp.value; bar.classList.toggle("qi-q", !!this.query);
                clearTimeout(this.searchT); this.searchT = setTimeout(() => this.refreshList(), 140);
            });
            inp.addEventListener("keydown", e => {
                e.stopPropagation();                                   // typing never reaches Discord's shortcuts
                if (e.key === "Escape") { inp.value = ""; this.query = ""; bar.classList.remove("qi-q"); this.refresh(); inp.blur(); }
            });
            bar.querySelector(".qi-x").addEventListener("click", () => { inp.value = ""; this.query = ""; bar.classList.remove("qi-q"); this.refresh(); });
            bar.addEventListener("pointerup", e => {
                if (e.button !== 0) return;
                if (e.target.closest(".qi-head")) { this.paneCollapsed = !this.paneCollapsed; BdApi.Data.save(this.name, "pane", this.paneCollapsed); return this.renderBar(); }
                const f = e.target.closest(".qi-f")?.dataset.tab;
                if (!FOLDERS.includes(f)) return;
                const open = e.target.closest(".qi-open")?.dataset.id;
                if (open) return this.openChannel(open);
                const changed = f !== this.tab;
                if (changed) this.enterTab = f;
                this.tab = f;
                this.refresh();
                if (changed) this.swapIn(bar);
                clearTimeout(this.probeT); this.probeT = setTimeout(() => this.probe(f), 700);
            });
            if (scroller?.parentNode) scroller.parentNode.insertBefore(bar, scroller);
            else nav.prepend(bar);
            this.renderBar();
        };
        const safeEnsure = () => { try { ensure(); } catch (e) { if (!this.warned) { this.warned = true; console.warn("[QuietInbox] tab bar", e); } } };
        let queued = false;
        this.barObserver = new MutationObserver(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; if (!this.stopped) safeEnsure(); });
        });
        this.barObserver.observe(document.body, { childList: true, subtree: true });
        safeEnsure();
    }
    closedFavs() { // kept people whose conversation is closed in Discord's list
        if (this.tab !== "favorites") return [];
        return [...this.star].filter(id => !this.lastAllIds.includes(id) && !HIDDEN.has(this.folderOf(id)) && this.matches(id));
    }
    closedFavsHtml() {
        const ids = this.closedFavs();
        if (!ids.length) return "";
        const esc = s => String(s).replace(/[&<>"']/g, ch => "&#" + ch.charCodeAt(0) + ";");
        const nameOf = id => { const ch = this.ChannelStore?.getChannel?.(id), r = this.recipientOf(ch), u = r && this.UserStore?.getUser?.(r);
            return ch?.name || u?.globalName || u?.username || this.starMeta[id]?.name || "Conversation"; };
        return `<div class="qi-sep"></div>` + ids.map(id => `<div class="qi-f qi-open" data-tab="favorites" data-id="${esc(id)}" title="Open"><span class="qi-lamp"></span><span class="qi-l">${esc(nameOf(id))}</span></div>`).join("");
    }
    renderBar() {
        const bar = document.getElementById("quietinbox-bar");
        if (!bar) return;
        const { total, unread } = this.counts();
        // like email: unread counts for Inbox/Favorites/Unread/Archive, totals for Spam/Ignored/Blocked
        const num = f => HIDDEN.has(f) ? (total[f] ? `<span class="qi-n">${total[f]}</span>` : "")
            : (unread[f] ? `<span class="qi-n u">${unread[f]}</span>` : "");
        // one-shot effects (the icon lifts, the lamp lights) only on the render right after the click, not on every refresh
        const fx = f => (f === this.tab && f === this.enterTab ? " qi-enter" : "") + (f === "favorites" && this.lit ? " qi-lit" : "");
        const row = f => `<div class="qi-f${f === this.tab ? " qi-on" : ""}${fx(f)}" data-tab="${f}"><i class="qi-ic qi-ic-${f}"></i><span class="qi-l">${LABELS[f]}</span>${num(f)}</div>`;
        const cur = `${LABELS[this.tab]}${unread[this.tab] && !HIDDEN.has(this.tab) ? ` (${unread[this.tab]})` : ""}`;
        (bar.querySelector(".qi-body") || bar).innerHTML = `<div class="qi-head"><span class="qi-tw">${this.paneCollapsed ? "▸" : "▾"}</span><i class="qi-ic qi-ic-head"></i>Folders<span class="qi-cur">${this.paneCollapsed ? cur : ""}</span></div>`
            + (this.paneCollapsed ? "" : FOLDERS.filter(f => !HIDDEN.has(f)).map(row).join("") + `<div class="qi-sep"></div>` + [...HIDDEN].map(row).join(""))
            + this.closedFavsHtml()
            + (this.lastAllIds.some(id => this.visibleInTab(id)) || (this.tab === "favorites" && this.closedFavs().length) ? "" : `<div class="qi-empty">${this.tab === "favorites" ? `<div class="qi-art qi-art-fav"></div>` : ICON[this.tab] ? `<div class="qi-art qi-art-s qi-art-${this.tab}"></div>` : ""}<div class="qi-hint">${this.query ? `No conversation in ${LABELS[this.tab]} matches \u201c${String(this.query).replace(/[&<>"']/g, ch => "&#" + ch.charCodeAt(0) + ";")}\u201d.` : EMPTY[this.tab] || ""}</div></div>`);
        this.enterTab = null; this.lit = false;
    }
    /* a folder was chosen: Discord's DM rows (and the empty picture) step in; the class comes off again after the animation */
    swapIn(bar) {
        const nav = bar?.closest?.("nav");
        if (!nav) return;
        nav.classList.remove("qi-swap"); void nav.offsetWidth; nav.classList.add("qi-swap");
        clearTimeout(this.swapT); this.swapT = setTimeout(() => nav.classList.remove("qi-swap"), 480);
    }

    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [
                { type: "switch", id: "quietDMs", name: "Only the Inbox counts",
                  note: "The Home number, unread badges and notifications come only from DMs in your main Inbox; Archive, Spam, Ignored and Blocked stay silent. Do Not Disturb still silences everything.", value: this.settings.quietDMs },
                { type: "switch", id: "liturgyQuiet", name: "Liturgy quiet", note: "Sunday and great-feast mornings, 8 am to noon: no DM pop-ups, and no message pings or bell (Discord's ping cannot tell DMs from servers).", value: this.settings.liturgyQuiet },
                { type: "switch", id: "discordFavorites", name: "Discord's own Favorites count as Favorites", value: this.settings.discordFavorites },
                { type: "switch", id: "noDMBubbles", name: "No DM bubbles in the server bar", value: this.settings.noDMBubbles },
                { type: "switch", id: "pinBubbles", name: "Pinned people stay in the server bar", note: "Everyone you pin (keep in Favorites) shows in the server bar with their picture and status.", value: this.settings.pinBubbles },
                { type: "switch", id: "focusMode", name: "Open DMs full screen",
                  note: "Opening a DM hides your other DMs and the server list, like a phone messaging app. ‹ Inbox (top left) takes you back.", value: this.settings.focusMode },
                { type: "switch", id: "hideBlocked", name: "Blocked people go to Spam too", value: this.settings.hideBlocked },
                { type: "switch", id: "silenceLive", name: "Fully silence Spam (strongest)",
                  note: "Live messages and typing from Spam people are dropped before Discord sees them, so nothing can move, flash or ping. Open the chat from the Spam folder to read it (it loads from Discord; while it is open, new messages show live).", value: this.settings.silenceLive },
                { type: "switch", id: "nonFriendsToSpam", name: "DMs from non-friends go to Spam", value: this.settings.nonFriendsToSpam },
                { type: "switch", id: "archiveReturnsOnReply", name: "A new reply moves an archived chat back to Inbox", value: this.settings.archiveReturnsOnReply },
            ],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.refresh(); this.updateFocus(); },
        });
    }
};
