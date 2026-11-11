/**
 * @name ServerFiles
 * @author cl3ar-ai
 * @version 1.0.0
 * @description Shows your server list like a file manager: folders open and close with ▸/▾ and a pixel-art codex that opens, servers inside are indented on a tree line, each server is a small painted icon, each kind of channel has its own pixel picture, and a candle burns beside the open one. Works on top of DisplayServersAsChannels (keep that on).
 */

/* ---------- pixel art: one hand-drawn 16x16 picture per kind of row (light from the top left) ----------
   Shared palette with St Seraphim's inbox art: outline, then 3-4 shades per material from lit edge to shadow. */
const PAL = {
    k: "#1b120c",                                                        // outline (warm near-black)
    G: "#5a3a0c", g: "#a8741c", y: "#d9b24e", Y: "#f6e3a1", w: "#fff6d0", // gold leaf, shadow -> glint
    R: "#3d0a0a", r: "#7e1c18", c: "#c8322a", C: "#e8603c",               // cinnabar / red leather
    P: "#6b4a24", p: "#c9a66b", q: "#e8d3a0", Q: "#fbf0d0",               // parchment and ink
    b: "#1e3f8a", l: "#3a6ad0", L: "#8ab0f0",                            // lapis (the Theotokos' blue)
    e: "#1e6a34", n: "#3da35a", N: "#9be0a8",                            // malachite
    o: "#5e3a1c", u: "#8f5e30", U: "#c08a50",                            // wood
    S: "#2c2c34", s: "#5d5f6b", t: "#9a9caa", T: "#d2d4de",               // stone
    Z: "#3b2410", z: "#7d5326", x: "#b98a4a", X: "#e6c58a",               // bell bronze
    f: "#ffb43a", F: "#fff2a8", m: "#8a8a9a", M: "#c8c8d4", h: "#e2b48a", // flame, incense smoke, skin
};
const ART = {
    // server folder: a codex bound in red leather, gilt corners, the Cross and two gold clasps ...
    codex: [
        "................",
        ".kkkkkkkkkkkk...",
        ".kCCCCCCCCCckk..",
        ".kCyccccccyrkqk.",
        ".kCcccYyccYYYYk.",
        ".kCccYYyycggggk.",
        ".kCcccYycccrkqk.",
        ".kCcYYYyyycrkpk.",
        ".kCcccYycccrkqk.",
        ".kCccYYyccYYYYk.",
        ".kCcccYyycggggk.",
        ".kCyccYyccyrkqk.",
        ".kcrrrrrrrrrkpk.",
        ".kkkkkkkkkkkkqk.",
        "..kqpqpqpqpqqqk.",
        "...kkkkkkkkkkk..",
    ],
    // ... the cover swinging back on its spine (the in-between frame) ...
    codexHalf: [
        "................",
        ".kkkkkkkkkkkk...",
        ".kCccrkQQQQQkk..",
        ".kCycrkQPPPQkqk.",
        ".kCccrYQQQQQkqk.",
        ".kCYyrkQPPPQkqk.",
        ".kCYyrkQQQQQkqk.",
        ".kYYyrkQcccQkpk.",
        ".kCYyrkQQQQQkqk.",
        ".kCYyrYQPPPQkqk.",
        ".kCYyrkQQQQQkqk.",
        ".kCycrkQPPQQkqk.",
        ".kcrrrkqqqqqkpk.",
        ".kkkkkkkkkkkkqk.",
        "..kqpqpqpqpqqqk.",
        "...kkkkkkkkkkk..",
    ],
    // ... and open: an illuminated spread, a gilt initial, a red rubric, lines of text
    codexOpen: [
        "................",
        "................",
        ".kkkkkk..kkkkkk.",
        "kQQQQQQkkQQQQQQk",
        "kQyyyQqppqccccqk",
        "kQycyQqppqQQQQqk",
        "kQyyyPPppqPPPPqk",
        "kQQQQQqppqQQQQqk",
        "kQPPPPqppqPPPqqk",
        "kQQQQQqppqQQQQqk",
        "kQPPPPqppqPPPPqk",
        "kqqqqqqppqqqqqqk",
        "kpqpqpqkkqpqpqpk",
        "kCcccccrrcccccrk",
        ".kkkkkkkkkkkkkk.",
        "................",
    ],
    // a server: a painted icon on a wooden board, the Theotokos in red maphorion over blue on gold
    icon: [
        "................",
        "..kkkkkkkkkkkk..",
        "..kUUUUUUUUUok..",
        "..kUyyYYYYyyok..",
        "..kUyYrccrYyok..",
        "..kUyYchhrYyok..",
        "..kUyYchhrYyok..",
        "..kUyccccrryok..",
        "..kUycclbrryok..",
        "..kUyCclbrYyok..",
        "..kUyCclbrryok..",
        "..kUcCclbrrrok..",
        "..kUrrrrrrrrok..",
        "..kuoooooooook..",
        "..kkkkkkkkkkkk..",
        "................",
    ],
    // Home: a little church, lapis onion dome and gold Cross
    church: [
        ".......Yg.......",
        "......YYgg......",
        ".......Yg.......",
        "......kLlk......",
        ".....kLllbk.....",
        "....kLlllbbk....",
        "....kLllllbk....",
        ".....kllbbk.....",
        "..kkkkkkkkkkkk..",
        ".kCccccccccccrk.",
        "..kQQQQkkQQQqk..",
        "..kQQQkuokQQqk..",
        "..kQbQkuokQbqk..",
        "..kqqqkuokqqpk..",
        ".kkkkkkkkkkkkkk.",
        "................",
    ],
    // a category: two books lying on the shelf, gilt bands on the spines
    books: [
        "................",
        "................",
        "................",
        "................",
        "...kkkkkkkkkk...",
        "...kNNyNNNyNk...",
        "...knnynnnynk...",
        "...keeyeeeyek...",
        ".kkkkkkkkkkkkkk.",
        ".kLLLyLLLLLyLLk.",
        ".klllylllllyllk.",
        ".klllylllllyllk.",
        ".kbbbgbbbbbgbbk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
    ],
    // a text channel: an unrolled scroll, lines of ink and one red line
    scroll: [
        "................",
        "..yy........yy..",
        ".kkkk......kkkk.",
        ".kQpkkkkkkkkQpk.",
        ".kQpkQQQQQQkQpk.",
        ".kQpkqPPPPqkQpk.",
        ".kQpkQQQQQQkQpk.",
        ".kQpkqPPPqqkQpk.",
        ".kQpkQQQQQQkQpk.",
        ".kQpkqccccqkQpk.",
        ".kQpkQQQQQQkQpk.",
        ".kQpkqqqqqqkQpk.",
        ".kQpkkkkkkkkQpk.",
        ".kkkk......kkkk.",
        "..yy........yy..",
        "................",
    ],
    // a voice channel: a bronze bell with a gold lip and its clapper
    bell: [
        "................",
        ".......kk.......",
        "......kxzk......",
        ".....kXXxzk.....",
        "....kXwxxxzk....",
        "....kXxxxxzk....",
        "....kXxxxxzk....",
        "....kXxxxxzk....",
        "....kXxxxxzk....",
        "...kXxxxxxxzk...",
        "..kXxxxxxxxxzk..",
        ".kyyyyyyyyyygGk.",
        ".kkkkkkkkkkkkkk.",
        "......kxzk......",
        ".......kk.......",
        "................",
    ],
    // a stage: a censer on its chains, coals glowing through the lid, smoke rising
    censer: [
        ".......yy.......",
        "......g..g......",
        ".....g....g..M..",
        ".....g....g.Mm..",
        ".....kkyykk.m...",
        "....kYYyygGk....",
        "....kYfyfgGk....",
        "...kkkkkkkkkk...",
        "...kYyyyyygGk...",
        "...kYyCyyCgGk...",
        "....kyyyyyggk...",
        ".....kgggGGk....",
        "......kggk......",
        ".....kyyyGk.....",
        ".....kkkkkk.....",
        "................",
    ],
    // an announcement channel: the herald's gold trumpet with a red banner and its Cross
    trumpet: [
        "................",
        "................",
        ".............k..",
        "............kYk.",
        "...........kYyk.",
        "..kkkkkkkkkYyyk.",
        ".gYYYYYYYYYyyGk.",
        "..kkkkkkkkkgyGk.",
        "..kCcYcrk..kgGk.",
        "..kCYYYrk...kGk.",
        "..kCcYcrk....k..",
        "..kCcYcrk.......",
        "..kccccrk.......",
        "..kyyyyyk.......",
        "...y.y.y........",
        "................",
    ],
    // a forum: the Gospel lying open on a lectern draped in red
    lectern: [
        "................",
        "................",
        "..kkkkk..kkkkk..",
        ".kQQQQQkkQQQQQk.",
        ".kQcPPqppqPPPqk.",
        ".kQQQQqppqQQQqk.",
        ".kkkkkkkkkkkkkk.",
        "..kyyyyyyyyyyk..",
        "..kCcccYYcccrk..",
        "..kCccYYYYccrk..",
        "..kCcccYYcccrk..",
        "..kyyyyyyyyyyk..",
        "......kuok......",
        "......kuok......",
        "....kUuuuuok....",
        "....kkkkkkkk....",
    ],
    // the rules channel: the two stone tablets
    tablets: [
        "................",
        "...kkk....kkk...",
        "..kTTtk..kTTtk..",
        ".kTTttskkTTttsk.",
        ".kTSSSskkTSSSsk.",
        ".kTtttskkTtttsk.",
        ".kTSStskkTSStsk.",
        ".kTtttskkTtttsk.",
        ".kTSSSskkTSSSsk.",
        ".kTtttskkTtttsk.",
        ".kTSStskkTSStsk.",
        ".kTtttskkTtttsk.",
        ".kssssskksssssk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
    ],
    // beside the open channel: a beeswax candle, two flame frames
    candle: ["..f..", ".fFf.", ".fwf.", "..f..", "kkzkk", "kYygk", "kYygk", "kYygk", "kYygk", "kYygk", "kYygk", "kkkkk"],
    candle2: [".f...", ".Ff..", "fFwf.", ".ff..", "kkzkk", "kYygk", "kYygk", "kYygk", "kYygk", "kYygk", "kYygk", "kkkkk"],
    // unread: a small red wax seal; hover: a glint of gold
    seal: [".kk.", "kCck", "kcrk", ".kk."],
    glint: [".w.", "wYw", ".w."],
};
// frames laid side by side in one strip; each colour is one <path> of run-length rectangles
const pixSvg = (...frames) => {
    const W = frames[0][0].length, H = frames[0].length, d = {};
    frames.forEach((rows, i) => rows.forEach((row, y) => row.replace(/(.)\1*/g, (run, ch, x) => {
        if (PAL[ch]) d[ch] = (d[ch] || "") + `M${i * W + x} ${y}h${run.length}v1h-${run.length}z`;
        return run;
    })));
    const s = `<svg xmlns='http://www.w3.org/2000/svg' width='${W * frames.length}' height='${H}' viewBox='0 0 ${W * frames.length} ${H}' shape-rendering='crispEdges'>${Object.keys(d).map(k => `<path fill='${PAL[k]}' d='${d[k]}'/>`).join("")}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
};
const PX = Object.fromEntries(Object.keys(ART).map(k => [k, pixSvg(ART[k])]));
PX.codexStrip = pixSvg(ART.codex, ART.codexHalf, ART.codexOpen);   // 48x16: closed, half, open
PX.candleStrip = pixSvg(ART.candle, ART.candle2);                  // 10x12: two flame frames
// which picture a tree row shows (tested)
const iconOf = r => r.kind === "home" ? "church" : r.kind === "folder" ? "codex" : r.kind === "guild" ? "icon" : r.kind === "category" ? "books"
    : r.rules ? "tablets" : ({ 2: "bell", 13: "censer", 5: "trumpet", 15: "lectern", 16: "lectern" })[r.type] || "scroll";
const MOTION = q => `@media (prefers-reduced-motion: no-preference){${q}}`;

const ON = `body.styledGuildsAsChannels_71509e nav[class*="guilds"]`;
const OPEN = `:is([class*="isExpanded"],[aria-expanded="true"],:has(> ul[role="group"] [data-list-item-id]))`;

module.exports = class ServerFiles {
    static ART = { PAL, ART, PX, iconOf };
    constructor(meta) { this.name = meta?.name || "ServerFiles"; }

    /* one distinct picture per closed folder, in the folder's own colour (tested) */
    static folderBarCss(folders) {
        const SET = ["codex", "church", "icon", "bell", "censer", "scroll", "books", "lectern", "trumpet", "tablets"];
        const BAR = 'body:not(.styledGuildsAsChannels_71509e) nav[class*="guilds"]', W = '[class*="closedFolderIconWrapper"]';
        const out = [`${BAR} ${W}{position:relative;background:#1d1a16 ${PX.codex} center/32px 32px no-repeat!important;image-rendering:pixelated;border-radius:14px!important}
${BAR} ${W} > *{visibility:hidden!important}`];
        let i = 0;
        for (const f of folders || []) {
            if (f?.folderId == null || !Array.isArray(f.guildIds) || f.guildIds.length < 2) continue;
            const id = String(f.folderId).replace(/[^0-9a-z-]/gi, ""), gs = f.guildIds.map(String).filter(g => /^\d+$/.test(g));
            const pic = PX[SET[i++ % SET.length]];
            const col = typeof f.folderColor === "number" ? "#" + f.folderColor.toString(16).padStart(6, "0") : "#c9a24a";
            const sel = [`${BAR} [data-list-item-id="guildsnav___${id}"] ${W}`, `${BAR} [aria-owns="folder-items-${id}"] ${W}`, ...gs.map(g => `${BAR} ${W}:has(img[src*="/icons/${g}/"])`)].join(",");
            out.push(`:is(${sel}){background:#1d1a16 ${pic} center/32px 32px no-repeat!important;box-shadow:inset 0 0 0 2px ${col}!important}`);
        }
        return out.join("\n");
    }
    writeFolderCss() {
        const css = this.constructor.folderBarCss(this.FolderStore?.getGuildFolders?.() || []);
        if (css === this.lastFolderCss) return;
        this.lastFolderCss = css;
        BdApi.DOM.addStyle(this.name + "-folders", css);
    }
    buildCss() {
        // text-only, compact server list on top of DisplayServersAsChannels (keeps its Favorites, folders, Read All, etc.)
        return `
${ON}{width:200px!important;min-width:200px!important}
${ON} [class*="childWrapper"],${ON} [class*="folder_"],${ON} [class*="folderButton"]{height:26px!important}
${ON} [class*="listItem"]{margin-bottom:0!important}
/* no pictures or icons: server pictures, initials, folder pictures, the Favorites star, add/discover glyphs */
${ON} .name_71509e ~ img,${ON} .name_71509e ~ [class*="acronym"],${ON} .name_71509e ~ video,
${ON} [class*="childWrapper"] > svg,${ON} [class*="childWrapper"] > img,${ON} [class*="childWrapper"] > [class*="icon"],
${ON} [class*="folderIconWrapper"],${ON} [class*="expandedFolderIconWrapper"],${ON} [class*="expandedFolderBackground"]{display:none!important}
${ON} [class*="childWrapper"]{background:transparent!important;box-shadow:none!important;justify-content:flex-start!important;border-radius:0!important}
${ON} .name_71509e{font-size:13px!important;padding-left:6px}
/* folders open and close like a file tree */
${ON} [data-folder-name]::before{content:"▸";flex:none;width:12px;margin-left:4px;color:var(--text-muted,#888);font-size:11px;text-align:center}
${ON} ${OPEN} [data-folder-name]::before,${ON} [data-folder-name][aria-expanded="true"]::before{content:"▾"}
${ON} ul[role="group"]{margin-left:12px!important;border-left:1px solid rgba(255,255,255,.12);padding-left:4px!important}
/* the open server: a simple highlight */
${ON} [class*="selected"] [class*="childWrapper"]:has(> .name_71509e),
${ON} [class*="childWrapper"][class*="selected"]:has(> .name_71509e){background:var(--background-modifier-selected,rgba(255,255,255,.12))!important}
${ON} [class*="pill"]{display:none!important}
/* our own pixel art instead: arrow + codex on each folder (one pseudo: the arrow sits in its padding, the codex frame in its content box) */
${ON} [data-folder-name]::before{display:inline-block;box-sizing:border-box;width:32px;height:16px;margin-right:6px;line-height:16px;padding-left:16px;text-indent:-14px;text-align:left;align-self:center;
  background:${PX.codexStrip} 0 0 / 48px 16px no-repeat content-box;image-rendering:pixelated}
${ON} ${OPEN} [data-folder-name]::before,${ON} [data-folder-name][aria-expanded="true"]::before{background-position-x:-32px}
/* each server: its painted icon before the name */
${ON} [class*="childWrapper"] > .name_71509e:not([data-folder-name] *)::before{content:"";display:inline-block;width:16px;height:16px;margin-right:6px;vertical-align:-3px;
  background:${PX.icon} 0 0 / 16px 16px no-repeat;image-rendering:pixelated}
/* the open server: a candle burns beside it */
${ON} [class*="selected"] [class*="childWrapper"] > .name_71509e:not([data-folder-name] *)::before,
${ON} [class*="childWrapper"][class*="selected"] > .name_71509e:not([data-folder-name] *)::before{width:24px;
  background:${PX.candleStrip} 0 2px / 10px 12px no-repeat,${PX.icon} 8px 0 / 16px 16px no-repeat}
${MOTION(`
@keyframes cl3ar-cx-open{from{background-position-x:0}to{background-position-x:-32px}}
@keyframes cl3ar-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes cl3ar-flick{from{background-position:0 2px,8px 0}to{background-position:-5px 2px,8px 0}}
${ON} ${OPEN} [data-folder-name]::before,${ON} [data-folder-name][aria-expanded="true"]::before{animation:cl3ar-cx-open 270ms steps(3,jump-none) both}
${ON} ${OPEN} ul[role="group"] > *{animation:cl3ar-in 240ms steps(3,jump-end) both}
${[1, 2, 3, 4, 5].map(i => `${ON} ${OPEN} ul[role="group"] > :nth-child(${i + 1}){animation-delay:${i * 30}ms}`).join("\n")}
${ON} ${OPEN} ul[role="group"] > :nth-child(n+7){animation-delay:180ms}
@keyframes cl3ar-hop{0%{transform:none}40%{transform:translateY(-2px)}100%{transform:translateY(-1px)}}
${ON} [class*="childWrapper"]:hover > .name_71509e::before{animation:cl3ar-hop 200ms step-end both}
${ON} [class*="selected"] [class*="childWrapper"] > .name_71509e:not([data-folder-name] *)::before,
${ON} [class*="childWrapper"][class*="selected"] > .name_71509e:not([data-folder-name] *)::before{animation:cl3ar-flick 700ms steps(2,jump-none) infinite alternate}`)}`;
    }

    /* ---------- file tree: Folders > Servers > Categories > Channels ---------- */
    load() {
        this.open = new Set(BdApi.Data.load(this.name, "open") || []);
        this.settings = Object.assign({ treeOn: false }, BdApi.Data.load(this.name, "settings") || {});
    }
    save() {
        BdApi.Data.save(this.name, "open", [...this.open]);
        BdApi.Data.save(this.name, "settings", this.settings);
    }
    stores() {
        const W = BdApi.Webpack, g = (...n) => { for (const x of n) { const s = W.getStore(x); if (s) return s; } return null; };
        this.S = {
            Guild: g("GuildStore"), Sorted: g("SortedGuildStore"), GuildChannels: g("GuildChannelStore"),
            Channel: g("ChannelStore"), Perm: g("PermissionStore"), Read: g("ReadStateStore"),
            Settings: g("UserGuildSettingsStore"), SelGuild: g("SelectedGuildStore"), SelChannel: g("SelectedChannelStore"),
        };
        this.Router = W.getByKeys?.("transitionTo", "replaceWith") || W.getModule?.(W.Filters.byKeys("transitionTo"));
        BdApi.Data.save(this.name, "found", Object.fromEntries([...Object.entries(this.S).map(([k, v]) => [k, !!v]), ["Router", !!this.Router]]));
    }
    folders() {
        const S = this.S;
        const f = S.Sorted?.getGuildFolders?.();
        if (Array.isArray(f) && f.length) return f.map(x => ({ id: x.folderId ?? null, name: x.folderName, guildIds: x.guildIds || [] }));
        const ids = S.Sorted?.getFlattenedGuildIds?.() || Object.keys(S.Guild?.getGuilds?.() || {});
        return ids.map(id => ({ id: null, guildIds: [id] }));
    }
    channelsOf(gid) {
        const S = this.S, out = [];
        const gc = S.GuildChannels?.getChannels?.(gid);
        if (gc) {
            for (const key of ["SELECTABLE", "VOCAL", 4, "4"]) for (const e of gc[key] || []) if (e?.channel) out.push(e.channel);
        } else {
            const all = Object.values(S.Channel?.getMutableGuildChannelsForGuild?.(gid) || {});
            for (const ch of all) if (ch.type === 4 || !S.Perm?.can || S.Perm.can(1024n, ch)) out.push(ch);
        }
        const seen = new Set();
        return out.filter(c => !seen.has(c.id) && seen.add(c.id)).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    unread(cid) { try { return !!this.S.Read?.hasUnread?.(cid); } catch (_) { return false; } }
    mentions(cid) { try { return this.S.Read?.getMentionCount?.(cid) || 0; } catch (_) { return 0; } }

    /* pure model of the visible rows (tested) */
    rows() {
        const S = this.S, rows = [];
        const selG = S.SelGuild?.getGuildId?.(), selC = S.SelChannel?.getChannelId?.();
        rows.push({ kind: "home", depth: 0, label: "Home", selected: !selG, path: "/channels/@me" });
        const guildRows = (gid, depth) => {
            const g = S.Guild?.getGuild?.(gid);
            if (!g) return;
            const key = "g" + gid, isOpen = this.open.has(key);
            const chans = isOpen ? this.channelsOf(gid) : [];
            const muted = !!S.Settings?.isMuted?.(gid);
            const gChans = !isOpen ? this.channelsOf(gid) : chans;
            let unread = false, ment = 0;
            for (const c of gChans) if (c.type !== 4) { if (!muted && !S.Settings?.isChannelMuted?.(gid, c.id) && this.unread(c.id)) unread = true; ment += this.mentions(c.id); }
            rows.push({ kind: "guild", depth, key, id: gid, label: g.name, open: isOpen, selected: selG === gid, unread, mentions: ment, muted, path: `/channels/${gid}` });
            if (!isOpen) return;
            const byParent = new Map();
            for (const c of chans) if (c.type !== 4) { const p = c.parent_id || ""; (byParent.get(p) || byParent.set(p, []).get(p)).push(c); }
            const chanRow = (c, d) => rows.push({ kind: "channel", depth: d, id: c.id, type: c.type, rules: !!g.rulesChannelId && g.rulesChannelId === c.id, label: c.name, selected: selC === c.id,
                unread: this.unread(c.id) && !S.Settings?.isChannelMuted?.(gid, c.id), mentions: this.mentions(c.id), path: `/channels/${gid}/${c.id}` });
            for (const c of byParent.get("") || []) chanRow(c, depth + 1);
            for (const cat of chans.filter(c => c.type === 4)) {
                const kids = byParent.get(cat.id) || [];
                if (!kids.length) continue;
                const ck = "c" + cat.id, catOpen = !this.open.has("x" + cat.id); // categories start open; "x" = closed
                rows.push({ kind: "category", depth: depth + 1, key: ck, id: cat.id, label: cat.name, open: catOpen, unread: kids.some(k => this.unread(k.id)) });
                if (catOpen) for (const c of kids) chanRow(c, depth + 2);
            }
        };
        for (const f of this.folders()) {
            if (f.id == null || f.guildIds.length < 2 && !f.name) { for (const gid of f.guildIds) guildRows(gid, 0); continue; }
            const key = "f" + f.id, isOpen = this.open.has(key);
            rows.push({ kind: "folder", depth: 0, key, id: f.id, label: f.name || "Folder", open: isOpen,
                unread: f.guildIds.some(gid => this.channelsOf(gid).some(c => c.type !== 4 && this.unread(c.id))) });
            if (isOpen) for (const gid of f.guildIds) guildRows(gid, 1);
        }
        return rows;
    }

    toggle(row) {
        if (row.kind === "category") { const k = "x" + row.id; this.open.has(k) ? this.open.delete(k) : this.open.add(k); }
        else if (row.key) { this.open.has(row.key) ? this.open.delete(row.key) : this.open.add(row.key); }
        this.anim = { key: row.key, opening: !row.open };   // the next render plays this one opening or closing
        this.save();
        this.render();
    }
    go(path) {
        try { if (this.Router?.transitionTo) return this.Router.transitionTo(path); } catch (_) {}
        history.pushState({}, "", path); dispatchEvent(new PopStateEvent("popstate"));
    }

    treeCss() {
        return `
body.cl3ar-tree nav[class*="guilds"]{width:240px!important;min-width:240px!important}
body.cl3ar-tree nav[class*="guilds"] > :not(#cl3ar-tree){display:none!important}
#cl3ar-tree{position:absolute;top:0;left:0;right:0;bottom:0;overflow-y:auto;overflow-x:hidden;padding:6px 0;font:13px var(--nx-font,inherit);color:var(--text-normal,#ddd);user-select:none}
#cl3ar-tree .r{display:flex;align-items:center;height:24px;padding-right:8px;cursor:pointer;white-space:nowrap}
#cl3ar-tree .r:hover{background:var(--background-modifier-hover,rgba(255,255,255,.06))}
#cl3ar-tree .r.sel{background:var(--nx-black,#000);color:#fff}
#cl3ar-tree .r.un .t{font-weight:700;color:var(--text-strong,#fff)}
#cl3ar-tree .r.mu{opacity:.5}
#cl3ar-tree .a{flex:none;width:14px;text-align:center;font-size:10px;color:var(--text-muted,#888)}
#cl3ar-tree .g{flex:none;align-self:stretch;width:14px;border-left:1px solid rgba(255,255,255,.12);margin-left:6px;box-sizing:border-box}
#cl3ar-tree .r.k-guild .t{font-weight:600}
#cl3ar-tree .r.k-category .t{text-transform:uppercase;font-size:11px;letter-spacing:.04em;color:var(--text-muted,#999)}
#cl3ar-tree .r{position:relative;padding-left:6px}
#cl3ar-tree .i{position:relative;flex:none;width:16px;height:16px;margin-right:5px;background:0 0 / 16px 16px no-repeat;image-rendering:pixelated}
${["church", "icon", "books", "scroll", "bell", "censer", "trumpet", "lectern", "tablets"].map(k => `#cl3ar-tree .i-${k}{background-image:${PX[k]}}`).join("\n")}
#cl3ar-tree .i-codex{background:${PX.codexStrip} 0 0 / 48px 16px no-repeat} #cl3ar-tree .r.o > .i-codex{background-position-x:-32px}
/* unread: a red wax seal on the corner of the picture; muted: the colour drains */
#cl3ar-tree .r.un > .i::after{content:"";position:absolute;right:-2px;bottom:-1px;width:4px;height:4px;background:${PX.seal} 0 0 / 4px 4px;image-rendering:pixelated}
#cl3ar-tree .r.mu > .i{filter:grayscale(.8)}
/* the open channel: a beeswax candle burns in the margin */
#cl3ar-tree .r.sel::before{content:"";position:absolute;left:0;top:6px;width:5px;height:12px;background:${PX.candleStrip} 0 0 / 10px 12px no-repeat;image-rendering:pixelated}
#cl3ar-tree:has(.r.k-channel.sel) .r.k-guild.sel::before{display:none}
${MOTION(`
@keyframes cl3ar-cx-open{from{background-position-x:0}to{background-position-x:-32px}}
@keyframes cl3ar-cx-shut{from{background-position-x:-32px}to{background-position-x:0}}
@keyframes cl3ar-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes cl3ar-hop{0%{transform:none}40%{transform:translateY(-2px)}100%{transform:translateY(-1px)}}
@keyframes cl3ar-glint{0%{opacity:0}34%{opacity:1}67%{opacity:.5}100%{opacity:0}}
@keyframes cl3ar-flame{from{background-position-x:0}to{background-position-x:-5px}}
#cl3ar-tree .r.op > .i-codex{animation:cl3ar-cx-open 270ms steps(3,jump-none) both}
#cl3ar-tree .r.cl > .i-codex{animation:cl3ar-cx-shut 270ms steps(3,jump-none) both}
#cl3ar-tree .r.nw{animation:cl3ar-in 240ms steps(3,jump-end) both;animation-delay:calc(var(--n,0) * 30ms)}
#cl3ar-tree .r:hover > .i{transform:translateY(-1px)}
#cl3ar-tree .r.hv:hover > .i{animation:cl3ar-hop 200ms step-end both}
#cl3ar-tree .r.hv:hover > .i::before{content:"";position:absolute;right:-1px;top:-1px;width:3px;height:3px;background:${PX.glint} 0 0 / 3px 3px;image-rendering:pixelated;animation:cl3ar-glint 360ms step-end both}
#cl3ar-tree .r.sel::before{animation:cl3ar-flame 700ms steps(2,jump-none) infinite alternate}`)}
#cl3ar-tree .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
#cl3ar-tree .m{flex:none;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#b3261e;color:#fff;font-size:11px;font-weight:700;line-height:16px;text-align:center}`;
    }
    mountTree() {
        const nav = document.querySelector('nav[class*="guilds"]');
        if (!nav) return null;
        let el = nav.querySelector("#cl3ar-tree");
        if (!el) {
            el = document.createElement("div");
            el.id = "cl3ar-tree";
            // the hover hop plays only when the pointer really enters a row, never when a redraw puts a new row under it
            el.addEventListener("mouseover", e => { const r = e.target.closest?.(".r"); if (r && !r.contains(e.relatedTarget)) r.classList.add("hv"); });
            el.addEventListener("click", e => {
                const r = e.target.closest(".r");
                if (!r) return;
                const row = this.lastRows?.[+r.dataset.i];
                if (!row) return;
                const onArrow = e.target.classList.contains("a");
                if (row.kind === "folder" || row.kind === "category") return this.toggle(row);
                if (row.kind === "guild") { if (onArrow || row.selected) return this.toggle(row); if (!row.open) this.toggle(row); return this.go(row.path); }
                this.go(row.path);
            });
            if (getComputedStyle(nav).position === "static") nav.style.position = "relative";
            nav.appendChild(el);
        }
        return el;
    }
    render() {
        if (!this.settings.treeOn) return;
        const el = this.mountTree();
        if (!el) return;
        const rows = this.lastRows = this.rows();
        const nav = el.parentElement, panel = document.querySelector('section[class*="panels_"]');
        if (nav && panel) {
            const n = nav.getBoundingClientRect(), p = panel.getBoundingClientRect();
            const overlap = p.left < n.right && p.right > n.left && p.top < n.bottom ? Math.ceil(n.bottom - p.top) + 4 : 0;
            el.style.bottom = overlap + "px";
        }
        const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        // motion only right after a toggle: that row opens/shuts, and the rows it revealed step in (never on ordinary redraws)
        const ids = rows.map(r => r.kind + ":" + (r.key || r.id || r.label));
        const a = this.anim, prev = this.prevIds;
        this.anim = null; this.prevIds = new Set(ids);
        if (a) this.animEnd = performance.now() + 420;   // store redraws (e.g. the selection after a click) wait until the motion ends
        let n = 0;
        el.innerHTML = rows.map((r, i) => {
            const arrow = r.open === undefined ? "" : r.open ? "▾" : "▸";
            const toggled = a && r.key && r.key === a.key, fresh = a?.opening && prev && !prev.has(ids[i]);
            const cls = ["r", "k-" + r.kind, r.open && "o", r.selected && "sel", r.unread && "un", r.muted && "mu",
                toggled && (a.opening ? "op" : "cl"), fresh && "nw"].filter(Boolean).join(" ");
            const style = fresh ? ` style="--n:${Math.min(n++, 5)}"` : "";
            return `<div class="${cls}" data-i="${i}"${style}>${'<span class="g"></span>'.repeat(r.depth)}<span class="a">${arrow}</span><span class="i i-${iconOf(r)}"></span><span class="t">${esc(r.label)}</span>${r.mentions ? `<span class="m">${r.mentions}</span>` : ""}</div>`;
        }).join("");
    }
    schedule() {
        if (this.queued) return;
        this.queued = true;
        const draw = () => { this.queued = false; try { this.render(); } catch (e) { console.error("[Cl3ar tree]", e); } };
        const wait = (this.animEnd || 0) - performance.now();
        if (wait > 0) setTimeout(() => requestAnimationFrame(draw), wait); else requestAnimationFrame(draw);
    }

    /* the server list must end above the bottom panel (mic / deafen / settings), never run under it */
    panelCss() {
        return `
nav[class*="guilds"] [class*="scroller"]{padding-bottom:calc(var(--cl3ar-panel-h,64px) + 8px)!important;box-sizing:border-box}
section[class*="panels_"]{background:var(--background-base-lowest,#0d0d0d)!important;border-top:1px solid rgba(255,255,255,.08)}
/* the bottom panel fills its whole space: edge to edge, flush with the bottom, square corners */
div[class*="sidebar_"] > section[class*="panels_"]{left:0!important;right:0!important;bottom:0!important;width:auto!important;margin:0!important;
  border-radius:0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;box-shadow:none!important}
div[class*="sidebar_"] > section[class*="panels_"] > *{border-radius:0!important;margin-left:0!important;margin-right:0!important}`;
    }
    measurePanel() {
        const p = document.querySelector('section[class*="panels_"]');
        const h = p ? Math.round(p.getBoundingClientRect().height) : 0;
        if (h && h !== this.panelH) { this.panelH = h; document.body.style.setProperty("--cl3ar-panel-h", h + "px"); }
    }
    start() {
        this.load();
        BdApi.DOM.addStyle(this.name + "-panel", this.panelCss());
        this.measurePanel();
        this.panelTimer = setInterval(() => { try { this.measurePanel(); } catch (_) {} }, 2000);
        BdApi.DOM.addStyle(this.name, this.buildCss() + this.treeCss());
        // closed server folders in Discord's own server bar: one pixel picture each instead of the 2x2 grid of servers
        this.FolderStore = BdApi.Webpack.getStore("SortedGuildStore");
        this.onFolders = () => { clearTimeout(this.folderT); this.folderT = setTimeout(() => { try { this.writeFolderCss(); } catch (_) {} }, 150); };
        this.FolderStore?.addChangeListener?.(this.onFolders);
        try { this.writeFolderCss(); } catch (_) {}
        if (!this.settings.treeOn) return;
        this.stores();
        document.body.classList.add("cl3ar-tree");
        this.onChange = () => this.schedule();
        for (const s of Object.values(this.S)) s?.addChangeListener?.(this.onChange);
        this.obs = new MutationObserver(() => { if (!document.getElementById("cl3ar-tree")) this.schedule(); });
        this.obs.observe(document.body, { childList: true, subtree: true });
        this.render();
    }
    stop() {
        clearInterval(this.panelTimer); clearTimeout(this.folderT);
        this.FolderStore?.removeChangeListener?.(this.onFolders); this.onFolders = null;
        BdApi.DOM.removeStyle(this.name + "-folders");
        BdApi.DOM.removeStyle(this.name + "-panel");
        document.body.style.removeProperty("--cl3ar-panel-h");
        for (const s of Object.values(this.S || {})) s?.removeChangeListener?.(this.onChange);
        this.obs?.disconnect();
        document.getElementById("cl3ar-tree")?.remove();
        document.body.classList.remove("cl3ar-tree");
        BdApi.DOM.removeStyle(this.name);
    }
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: [{ type: "switch", id: "treeOn", name: "Experimental: my own server tree (replaces the list)",
                note: "Off (recommended): your DisplayServersAsChannels list, with a pixel codex on each folder and an icon on each server.", value: this.settings.treeOn }],
            onChange: (_, id, value) => { this.settings[id] = value; this.save(); this.stop(); this.start(); },
        });
    }
};
