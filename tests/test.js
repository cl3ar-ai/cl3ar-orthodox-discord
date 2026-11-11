const assert = require("assert");
const P = require("path").resolve(process.argv[2] || require("path").join(__dirname, "..", "src")); // the src folder (any path)
const data = {}, styles = {}, patches = [];
const store = (o) => Object.assign({ emitChange(){}, addChangeListener(){}, removeChangeListener(){} }, o);
const interceptors = [];
const rel = { ignored: new Set(["U_IGN"]), blocked: new Set(["U_BLK"]), friends: new Set(["U_FRIEND"]) };
const chans = {
  c_friend: { id:"c_friend", type:1, recipients:["U_FRIEND"] },
  c_ign:    { id:"c_ign", type:1, recipients:["U_IGN"] },
  c_blk:    { id:"c_blk", type:1, recipients:["U_BLK"] },
  c_rand:   { id:"c_rand", type:1, recipients:["U_RAND"] },
  c_group:  { id:"c_group", type:3, recipients:["U_IGN","U_FRIEND"] },
  c_guild:  { id:"c_guild", type:0 },
};
const ALL = ["c_friend","c_ign","c_blk","c_rand","c_group"];
const stores = {
  ChannelStore: store({ getChannel:id=>chans[id], getDMFromUserId:u=>Object.values(chans).find(c=>c.type===1&&c.recipients[0]===u)?.id }),
  UserStore: store({ getCurrentUser:()=>({id:"ME"}), _dispatcher:{ _interceptors:interceptors, subscribe(){}, unsubscribe(){} } }),
  RelationshipStore: store({ isIgnored:u=>rel.ignored.has(u), isBlocked:u=>rel.blocked.has(u), isFriend:u=>rel.friends.has(u),
    getIgnoredIDs:()=>[...rel.ignored], getBlockedIDs:()=>[...rel.blocked] }),
  SelectedChannelStore: store({ getChannelId:()=>"c_friend" }),
  PrivateChannelSortStore: store({ getPrivateChannelIds:()=>ALL, getSortedChannels:()=>[[{channelId:"c_ign"}],ALL.map(c=>({channelId:c}))] }),
  PrivateChannelReadStateStore: store({ getUnreadPrivateChannelIds:()=>["c_ign","c_friend","c_blk"] }),
  FavoriteStore: store({ getFavoriteChannels:()=>({c_ign:{id:"c_ign"}, c_friend:{id:"c_friend"}}), isFavorite:id=>id==="c_ign"||id==="c_friend" }),
  ReadStateStore: store({ getMentionCount:()=>3, hasUnread:()=>true, getUnreadCount:()=>5 }),
};
const bodyCls=new Set(); let backBtn=null;
global.document = { getElementById:id=>id==="qi-back"?backBtn:null, querySelector:()=>null, createElement:()=>({addEventListener(){}, remove(){ backBtn=null; }}), body:{ classList:{ toggle:(c,on)=>on?bodyCls.add(c):bodyCls.delete(c), remove:c=>bodyCls.delete(c) }, appendChild:e=>{ backBtn=e; } } };
global.addEventListener=()=>{}; global.removeEventListener=()=>{}; global.dispatchEvent=()=>{};
global.MutationObserver = class { observe(){} disconnect(){} };
global.requestAnimationFrame = f=>f();
global.BdApi = {
  Data: { load:(n,k)=>data[n+k], save:(n,k,v)=>{data[n+k]=JSON.parse(JSON.stringify(v));} },
  Webpack: { getStore:n=>stores[n], Filters:{byKeys:()=>null}, waitForModule:()=>Promise.resolve(null) },
  Patcher: { after(n,obj,m,cb){ const o=obj[m]; obj[m]=function(...a){return cb(this,a,o.apply(this,a));}; patches.push([obj,m,o]); },
             instead(){}, unpatchAll(){ for(const [o,m,f] of patches.splice(0)) o[m]=f; } },
  ContextMenu: { patch:()=>()=>{}, buildItem:x=>x },
  DOM: { addStyle:(id,c)=>{styles[id]=c;}, removeStyle:id=>{delete styles[id];} },
  UI: { buildSettingsPanel:()=>null },
};
const QI = require(P + "/inbox.js");
const q = new QI({name:"QuietInbox"}); q.start();
const S = stores.PrivateChannelSortStore, R = stores.ReadStateStore;
assert.ok(bodyCls.has("qi-focus"), "open DM -> full screen"); assert.ok(backBtn, "back button");
// Inbox never contains ignored/blocked, even as a group-free DM
assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_friend","c_rand","c_group"]);
assert.strictEqual(S.getPrivateChannelIds(), S.getPrivateChannelIds(), "stable array between changes");
assert.deepStrictEqual(S.getSortedChannels().map(s=>s.map(x=>x.channelId)), [[],["c_friend","c_rand","c_group"]]);
// server bar unread bubbles + badges
assert.deepStrictEqual(stores.PrivateChannelReadStateStore.getUnreadPrivateChannelIds(), [], "no DM bubbles in the server bar");
q.settings.noDMBubbles = false; q.refresh();
assert.deepStrictEqual(stores.PrivateChannelReadStateStore.getUnreadPrivateChannelIds(), ["c_friend"], "bubbles only for Inbox DMs when allowed");
q.settings.noDMBubbles = true; q.refresh();
assert.strictEqual(R.getMentionCount("c_ign"), 0); assert.strictEqual(R.getMentionCount("c_friend"), 3);
assert.strictEqual(R.hasUnread("c_blk"), false); assert.strictEqual(R.getMentionCount("c_guild"), 3);
assert.deepStrictEqual(Object.keys(stores.FavoriteStore.getFavoriteChannels()), ["c_friend"], "favorites drop ignored");
assert.strictEqual(stores.FavoriteStore.isFavorite("c_ign"), false); assert.strictEqual(stores.FavoriteStore.isFavorite("c_friend"), true);
// live events: ignored DM dropped before Discord sees it; servers + selected chat untouched
const ic = interceptors[0];
assert.strictEqual(ic({type:"MESSAGE_CREATE", channelId:"c_ign", message:{channel_id:"c_ign", author:{id:"U_IGN"}}}), true);
assert.strictEqual(ic({type:"MESSAGE_CREATE", channelId:"c_new", message:{channel_id:"c_new", author:{id:"U_IGN"}}}), true, "new DM channel from ignored");
assert.strictEqual(ic({type:"TYPING_START", channelId:"c_blk", userId:"U_BLK"}), true);
assert.strictEqual(ic({type:"MESSAGE_CREATE", channelId:"c_guild", message:{channel_id:"c_guild", guild_id:"G", author:{id:"U_IGN"}}}), false, "servers untouched");
assert.strictEqual(ic({type:"MESSAGE_CREATE", channelId:"c_rand", message:{channel_id:"c_rand", author:{id:"U_RAND"}}}), false);
// manual spam + archive + star + folders
q.spam.add("c_rand"); q.refresh();
assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_friend","c_group"]);
assert.strictEqual(ic({type:"MESSAGE_CREATE", channelId:"c_rand", message:{channel_id:"c_rand", author:{id:"U_RAND"}}}), true);
q.archive.add("c_group"); q.star.add("c_friend"); q.star.add("c_ign"); q.refresh();
assert.strictEqual(R.getMentionCount("c_group"), 0, "archived DM never badges");
assert.strictEqual(R.getMentionCount("c_friend"), 3, "Inbox DM counts toward Home");
assert.strictEqual(R.hasUnread("c_group"), false);
assert.strictEqual(q.counts().unread.archive, 1, "Archive folder still shows its own unread");
{ const t = q.counts().total; assert.ok(t.inbox===1 && t.favorites===1 && t.archive===1 && t.spam===1 && t.ignored===1 && t.blocked===1, JSON.stringify(t)); }
q.tab="spam"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_rand"]);
q.tab="ignored"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_ign"]);
q.tab="blocked"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_blk"]);
assert.ok(styles["QuietInbox-net"].includes(':not(:has(a[href="/channels/@me/c_blk"]))') && !styles["QuietInbox-net"].includes(':not(:has(a[href="/channels/@me/c_rand"]))'), "viewing Blocked: only blocked rows stay");
q.tab="favorites"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_friend"], "favorites never include ignored");
assert.ok(styles["QuietInbox-net"].startsWith('[class*="privateChannels"] li:has(a[href^="/channels/@me/"]):not(:has(a[href="/channels/@me/c_friend"]))'), "Favorites works by CSS too, even if Discord's list ignores the store");
q.star.delete("c_friend"); q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_friend"], "Discord's own Favorites count too");
q.settings.discordFavorites=false; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), [], "setting off: only our pins");
q.settings.discordFavorites=true; q.star.add("c_friend");
q.tab="inbox"; q.star.add("c_rand"); q.spam.delete("c_rand"); q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds().slice(0,2), ["c_friend","c_rand"], "favorites pinned first");
q.star.delete("c_rand"); q.spam.add("c_rand");
q.tab="archive"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_group"]);
// snooze: out of the Inbox into Snoozed, silent, back on time and on top for an hour
q.tab="inbox"; q.refresh(); const before = S.getPrivateChannelIds().length;
q.setSnooze("c_friend", Date.now() + 60000);
assert.ok(!S.getPrivateChannelIds().includes("c_friend"), "snoozed chat leaves the Inbox");
q.tab="snoozed"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_friend"], "Snoozed folder shows it");
assert.strictEqual(q.isQuiet("c_friend"), true, "a snoozed chat never pings");
assert.strictEqual(q.wake(Date.now()), false, "not yet");
assert.strictEqual(q.wake(Date.now() + 61000), true, "wakes on time");
q.tab="inbox"; q.refresh(); assert.ok(S.getPrivateChannelIds().includes("c_friend"), "back in the Inbox");
{ const T = q.constructor.snoozeTimes(new Date(2026, 10, 11, 1, 30)); assert.ok(T.length === 4 && T[1][0].includes("evening") && new Date(T[3][1]).getDay() === 1, JSON.stringify(T)); }
{ const T = q.constructor.snoozeTimes(new Date(2026, 10, 11, 21, 0)); assert.ok(T.length === 3, "no 'this evening' after 7 pm"); }
q.tab="archive"; q.refresh();
// reply un-archives
q.onMessageCreate({message:{channel_id:"c_group", author:{id:"U_FRIEND"}}});
assert.ok(!q.archive.has("c_group"));
// CSS net covers ignored users by avatar id and spam channels by link
q.tab="inbox"; q.refresh();
const net = styles["QuietInbox-net"];
assert.ok(net.includes('a[href="/channels/@me/c_ign"]') && net.includes('/avatars/U_IGN/') && net.includes('/avatars/U_BLK/'));
assert.ok(!net.includes("c_friend"));
// persistence
q.save(); assert.deepStrictEqual(data["QuietInboxspam"], ["c_rand"]);
// newly ignored person disappears on relationship change
rel.ignored.add("U_FRIEND"); q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), ["c_group"]);
q.settings.focusMode=false; q.updateFocus(); assert.ok(!bodyCls.has("qi-focus"), "focus setting off");
// search box: filters by recipient name, in any folder
{ q.tab = "inbox"; q.query = ""; q.refresh(); const all = S.getPrivateChannelIds().length;
  const names = Object.fromEntries(S.getPrivateChannelIds().map(id => [id, q.nameOf(id)]));
  const one = Object.entries(names).find(([, n]) => n)?.[1]?.split(" ")[0];
  if (one) { q.query = one; q.refresh(); const got = S.getPrivateChannelIds(); assert.ok(got.length >= 1 && got.length <= all && got.every(id => q.nameOf(id).includes(one.toLowerCase())), "search narrows the list: " + one + " " + JSON.stringify(got)); }
  q.query = "zzzz-nobody"; q.refresh(); assert.deepStrictEqual(S.getPrivateChannelIds(), [], "no match, empty list");
  q.query = ""; q.refresh(); assert.strictEqual(S.getPrivateChannelIds().length, all, "cleared");
  console.log("Search: all checks passed"); }
q.tab = "inbox"; q.refresh();
q.stop(); assert.ok(!bodyCls.has("qi-focus")); assert.deepStrictEqual(S.getPrivateChannelIds(), ALL, "stop restores"); assert.strictEqual(interceptors.length, 0);
console.log("QuietInbox: all checks passed");

const PP = require(P + "/profiles.js");
stores.UserStore.getCurrentUser=()=>({id:"999999999999999999"});
chans["c_dm"]={id:"c_dm", type:1, recipients:["111111111111111111"]};
let sel="c_guild"; const selL=[]; stores.SelectedChannelStore.getChannelId=()=>sel;
stores.SelectedChannelStore.addChangeListener=f=>selL.push(f); stores.SelectedChannelStore.removeChangeListener=f=>selL.splice(selL.indexOf(f),1);
const BADNAME = "Bad" + String.fromCharCode(34) + String.fromCharCode(92) + "name" + String.fromCharCode(10) + " x";
stores.GuildStore = store({ getGuilds:()=>({a:{id:"222222222222222222", name:"Holy Orthodox Church"}, b:{id:"333333333333333333", name:BADNAME}}) });
const p = new PP({name:"PlainProfiles"}); p.start();
let css = styles["PlainProfiles"];
assert.ok(css.includes('img[src*="/avatars/"]') && css.includes('{display:none!important}'));
assert.ok(css.includes('img[src*="/avatars/999999999999999999/"],img[src*="/users/999999999999999999/avatars/"]{visibility:hidden'), "own picture hidden everywhere by default");
assert.ok(css.includes('[class*="privateChannels"] img[src*="/avatars/"]') && !css.includes('[class*="cozy"]'), "pictures fasted only in the DM list");
assert.ok(!css.includes(':not(:is([class*="userPopout"]'), "no clicked-profile exception: pins only");
// talking to someone: their picture comes back, and goes away when you leave
sel="c_dm"; selL.forEach(f=>f()); css = styles["PlainProfiles"];
assert.ok(!css.includes('111111111111111111'), "names only by default, even in a DM");
p.settings.showTalking=true; p.apply(); css = styles["PlainProfiles"];
assert.ok(css.includes(':not([src*="/avatars/111111111111111111/"])') && css.includes(':not([style*="/avatars/111111111111111111/"])'), "DM partner picture kept (in chat) when setting on");
assert.ok(css.includes('[class*="privateChannels"] [class*="avatar_"]{display:none!important}'), "the DM list keeps no picture space for anyone");
sel="c_guild"; selL.forEach(f=>f()); assert.ok(!styles["PlainProfiles"].includes("111111111111111111"));
globalThis.__cl3arPinned = ["123456789012345678"]; p.apply(); css = styles["PlainProfiles"];
assert.ok(css.includes(':not([src*="/users/123456789012345678/avatars/"])'), "a pinned person keeps their picture (outside the DM list)");
assert.ok(css.includes('[class*="peopleColumn"],[class*="nowPlayingColumn"]') && css.includes("var(--nx-cross, url(") , "friends page -> holy icon");
assert.ok(css.includes(":not(:has(button)):not(button){display:none") && css.includes("justify-content:flex-start"), "minimal panel");
assert.ok(css.includes(`li:has(a[href="/channels/@me"])`), "friends button hidden");
assert.ok(css.includes('[class*="spinner_"]{background:var(--nx-cross'), "spinner -> cross");
assert.ok(css.includes('li:has(a[href*="quest"])') && css.includes('href="/store"'));
p.settings.hideFriends=false; p.apply(); assert.ok(!styles["PlainProfiles"].includes('[class*="peopleColumn"],[class*="nowPlayingColumn"]'), "settings bring friends back");
globalThis.__cl3arPinned.push('1"]{}*{display:none'); p.apply(); assert.ok(!styles["PlainProfiles"].includes('1"]'), "bad ids rejected");
global.document.querySelectorAll=()=>[1,2]; p.probe(); assert.strictEqual(data["PlainProfilesprobe"].friendsList, 2);
css = styles["PlainProfiles"]; assert.ok(css.includes('body:not(.styledGuildsAsChannels_71509e) [data-list-item-id="guildsnav___222222222222222222"]::after{content:"HOC"}'), "server initials");
assert.ok(css.includes('guildsnav___333333333333333333"]::after{content:"Bx"}'), "quotes/backslashes stripped: " + css.match(/333333333333333333"\]::after\{content:"[^}]*/)?.[0]);
assert.ok(css.includes('nav[class*="guilds"] img[src*="/icons/"]'));
p.stop(); assert.ok(!styles["PlainProfiles"]); assert.strictEqual(selL.length, 0);
console.log("PlainProfiles: all checks passed");
// Liturgy quiet: Sunday and great-feast mornings
{ const Q = require(require("path").join(P, "inbox.js"));
  assert.strictEqual(Q.inLiturgy(new Date(2026, 10, 15, 9)), true, "Sunday 9 am");
  assert.strictEqual(Q.inLiturgy(new Date(2026, 10, 15, 13)), false, "Sunday 1 pm");
  assert.strictEqual(Q.inLiturgy(new Date(2026, 10, 11, 9)), false, "Wednesday 9 am");
  assert.strictEqual(Q.inLiturgy(new Date(2026, 8, 27, 10)), true, "Exaltation (Sunday anyway in 2026) ");
  assert.strictEqual(Q.inLiturgy(new Date(2026, 7, 19, 10)), true, "Transfiguration, a Wednesday");
  assert.strictEqual(Q.inLiturgy(new Date(2026, 4, 21, 10)), true, "Ascension, a Thursday");
  console.log("Liturgy quiet: all checks passed"); }


