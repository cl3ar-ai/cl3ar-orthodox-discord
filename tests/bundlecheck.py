import sys, pathlib, json
from playwright.sync_api import sync_playwright

T = pathlib.Path(__file__).parent
EXE = sys.argv[1]
bundle = (T.parent / "dist" / "Cl3ar_orthodox_discord.plugin.js").read_text(encoding="utf-8")
fixture = (T / "orthocal-fixture.json").read_text(encoding="utf-8")

html = """<html><head><style>html,body{margin:0;height:100%;background:url(x.png)} #app-mount{height:100%}
.content_c{display:grid;grid-template-columns:540px 1fr;grid-template-rows:100%;height:100%} .sidebar_s{position:relative;display:grid;grid-template-rows:1fr;height:100%}
nav.guilds_g{position:absolute;left:0;top:0;bottom:0;width:240px} nav.privateChannels_x{position:absolute;left:240px;top:0;right:0;bottom:60px}
section.panels_p{position:absolute;left:8px;bottom:8px;width:500px;height:60px;border-radius:8px}
.page_p{position:relative;display:flex;flex-direction:column} .tabBody_z{position:relative;flex:1}</style></head><body><div id="app-mount"><div class="content_c">
<div class="sidebar_s" id="sidebar">
<nav class="guilds_g"><div class="scroller_q" id="gscroll"><div class="old" id="oldlist">old server icons</div><div class="pill_p" id="pill"><span class="item_i"></span></div></div></nav>
<nav class="privateChannels_x"><div class="scroller_s"><ul><div class="friendsButtonContainer_f" id="frow"><li><a class="link_l">Friends</a></li></div></ul></div></nav>
<section class="panels_p"><div class="container_c"><div class="accountPopoutButtonWrapper_a" id="acct"><div class="accountPopoutButton_a" role="button" aria-label="Manage profile and status" onclick="window.__statusOpened=1">you Idle</div></div><div class="buttons_b"><button aria-label="Mute">m</button><button aria-label="User Settings">s</button></div></div></section>
</div>
<div class="page_p" id="page"><section class="title_h container_x" id="chdr"><div class="toolbar_t" id="tb2"><div class="avatar_w" id="havatar"><svg></svg></div><div aria-label="Start Voice Call" role="button" id="tvoice">v</div><div aria-label="Start Video Call" role="button" id="tvideo">c</div><div aria-label="Pinned Messages" role="button" id="tpin">p</div><div class="search_s" id="tsearch">search</div></div></section><div class="messagesWrapper_m" id="msgs" style="position:relative;height:100px;background:url(theotokos.png)"></div><main class="container_m" aria-label="Friends"><section role="navigation" id="fhdr"><div role="tablist"><div role="tab">Online</div></div></section>
<div class="tabBody_z" id="tb"><div class="peopleColumn_1" id="people">friends list<img id="fpic" src="https://cdn.discordapp.com/avatars/111111111111111111/a.png"></div></div></main></div>
</div></div></body></html>"""

harness = r"""
window.module={exports:null}; const data={"Cl3ar_orthodox_discordservers.settings":{treeOn:true}}; window.__data=data;
const store=o=>Object.assign({emitChange(){},addChangeListener(){},removeChangeListener(){}},o);
const chans={ c1:{id:"c1",type:1,recipients:["u1"]}, t1:{id:"t1",type:0,name:"general",parent_id:"cat1",position:0}, t2:{id:"t2",type:0,name:"prayer-requests",parent_id:"cat1",position:1},
  cat1:{id:"cat1",type:4,name:"Text Channels",position:0}, v1:{id:"v1",type:2,name:"Liturgy",parent_id:"",position:5} };
const stores={ ChannelStore:store({getChannel:id=>chans[id], getMutableGuildChannelsForGuild:()=>({})}),
 UserStore:store({getCurrentUser:()=>({id:"999999999999999999"}),_dispatcher:{_interceptors:[],subscribe(){},unsubscribe(){}}}),
 RelationshipStore:store({isIgnored:()=>false,isBlocked:()=>false,isFriend:()=>true,getIgnoredIDs:()=>[],getBlockedIDs:()=>[]}),
 SelectedChannelStore:store({getChannelId:()=>null}), SelectedGuildStore:store({getGuildId:()=>null}),
 PrivateChannelSortStore:store({getPrivateChannelIds:()=>["c1"]}),
 GuildStore:store({getGuild:id=>({g1:{id:"g1",name:"Holy Church"},g2:{id:"g2",name:"Botyard"}})[id], getGuilds:()=>({})}),
 SortedGuildStore:store({getGuildFolders:()=>[{folderId:7,folderName:"Orthodoxy",guildIds:["g1"]},{folderId:null,guildIds:["g2"]}]}),
 GuildChannelStore:store({getChannels:gid=>gid==="g1"?{SELECTABLE:[{channel:chans.t1},{channel:chans.t2}],VOCAL:[{channel:chans.v1}],4:[{channel:chans.cat1}]}:{SELECTABLE:[]}}),
 ReadStateStore:store({hasUnread:id=>id==="t2",getMentionCount:id=>id==="t2"?2:0}), UserGuildSettingsStore:store({isMuted:()=>false,isChannelMuted:()=>false}) };
window.__nav=[]; window.__stores=stores;
window.BdApi={ Data:{load:(n,k)=>data[n+k],save:(n,k,v)=>{data[n+k]=v}},
 Webpack:{getStore:n=>stores[n],Filters:{byKeys:()=>null},waitForModule:()=>new Promise(()=>{}),getByKeys:()=>({transitionTo:p=>__nav.push(p)})},
 Patcher:{after(n,o,m,cb){const f=o[m];o[m]=function(...a){return cb(this,a,f.apply(this,a))}},instead(){},unpatchAll(){}},
 ContextMenu:{patch:()=>()=>{},buildItem:x=>x}, React:{createElement:(...a)=>a},
 Net:{fetch:async u=>u.includes("orthocal")?{ok:true,text:async()=>FIXTURE}:{ok:true,text:async()=>u.includes("bbci")||u.includes("npr")?'<rss><channel><item><title>World headline one</title><link>https://www.bbc.co.uk/news/1</link><pubDate>Wed, 11 Nov 2026 01:00:00 GMT</pubDate></item></channel></rss>':u.includes("videos")?'<rss><channel><item><title>Sermon on humility</title><link>https://example.org/videos/1</link><pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>':'<rss><channel><item><title>Memory of Martyr Menas</title><link>https://example.org/news/2</link><pubDate>Tue, 12 Nov 2024 10:00:00 GMT</pubDate></item></channel></rss>'}},
 DOM:{addStyle:(id,c)=>{let s=document.getElementById("s-"+id)||document.head.appendChild(Object.assign(document.createElement("style"),{id:"s-"+id}));s.textContent=c}, removeStyle:id=>document.getElementById("s-"+id)?.remove()},
 UI:{buildSettingsPanel:c=>c} };
""".replace("FIXTURE", json.dumps(fixture))

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=EXE)
    pg = b.new_page(viewport={"width": 1400, "height": 800})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
    pg.route("http://discord.test/**", lambda r: r.fulfill(status=200, content_type="text/html", body=html))
    pg.goto("http://discord.test/channels/@me")
    pg.evaluate(harness)
    pg.evaluate("(src)=>{ new Function('module',src)(window.module); window.cl=new window.module.exports({}); window.cl.start(); }", bundle)
    pg.wait_for_timeout(300)
    J = pg.evaluate
    st = lambda sel, p: J(f"getComputedStyle(document.querySelector({json.dumps(sel)})).{p}")
    rows = lambda: J("[...document.querySelectorAll('#cl3ar-tree .r')].map(r=>r.innerText.replace(/\\s+/g,' ').trim())")
    c = {}
    r0 = rows()
    folders = J("[...document.querySelectorAll('#quietinbox-bar .qi-f .qi-l')].map(e=>e.textContent)")
    c["inbox: 8 email folders"] = folders == ["Inbox", "Favorites", "Unread", "Snoozed", "Archive", "Spam", "Ignored", "Blocked"]
    pg.click("#quietinbox-bar .qi-f[data-tab=archive]"); pg.wait_for_timeout(30)
    c["inbox: clicking a folder switches"] = J("cl.mods.find(m=>m.ns==='inbox').inst.tab") == "archive" and J("document.querySelector('#quietinbox-bar .qi-on').dataset.tab") == "archive"
    pg.click("#quietinbox-bar .qi-head"); pg.wait_for_timeout(30)
    c["inbox: folder pane collapses to one line"] = J("document.querySelectorAll('#quietinbox-bar .qi-f').length") == 0 and "Archive" in J("document.querySelector('#quietinbox-bar .qi-cur').textContent")
    pg.click("#quietinbox-bar .qi-head"); pg.click("#quietinbox-bar .qi-f[data-tab=favorites]"); pg.wait_for_timeout(30)
    c["empty Favorites: pixel star + hint"] = J("!!document.querySelector('#quietinbox-bar .qi-empty .qi-art')") and "right-click" in J("document.querySelector('#quietinbox-bar .qi-hint').textContent").lower()
    pg.click("#quietinbox-bar .qi-f[data-tab=inbox]"); pg.wait_for_timeout(30)
    c["tree: Home + closed folder + loose server"] = r0 == ["Home", "▸ Orthodoxy", "▸ Botyard"]
    c["tree: one pixel icon per row (church, codex, painted icon)"] = J("[...document.querySelectorAll('#cl3ar-tree .r')].map(r=>[...r.querySelectorAll('.i')].map(i=>i.className).join())") == ["i i-church", "i i-codex", "i i-icon"]
    c["tree: old server list hidden"] = st("#gscroll", "display") == "none"
    c["tree: stops above bottom panel"] = J("parseInt(document.getElementById('cl3ar-tree').style.bottom)") >= 60
    pg.click("#cl3ar-tree .r:nth-child(2)"); pg.wait_for_timeout(50)
    r1 = rows()
    c["open folder shows server"] = r1[1] == "▾ Orthodoxy" and r1[2].startswith("▸ Holy Church")
    pg.click("#cl3ar-tree .r:nth-child(3) .a"); pg.wait_for_timeout(50)
    r2 = rows()
    c["open server shows channels + category"] = "▾ TEXT CHANNELS" in [x.upper() for x in r2] and "general" in r2 and "Liturgy" in r2 and any(x.startswith("prayer-requests") for x in r2)
    c["guide lines by depth"] = J("[...document.querySelectorAll('#cl3ar-tree .r')].map(r=>r.querySelectorAll('.g').length)").count(3) >= 2
    c["unread bold + mention count"] = J("[...document.querySelectorAll('#cl3ar-tree .r.un')].some(r=>r.innerText.includes('prayer-requests') && r.querySelector('.m')?.innerText==='2')")
    pg.click("#cl3ar-tree >> text=general")
    c["click channel navigates"] = J("__nav").count("/channels/g1/t1") == 1
    c["home: saints shown"] = "Anastasia" in J("document.getElementById('cl3ar-home')?.innerText || ''")
    pg.screenshot(path=str(T / "bundlecheck.png"))
    pg.click("#cl3ar-home .h-reading >> nth=0"); pg.wait_for_timeout(50)
    c["home: reading opens text"] = "beseech you" in J("document.getElementById('cl3ar-home').innerText")
    c["home: living scene banner"] = "svg" in J("getComputedStyle(document.querySelector('#cl3ar-home .h-banner')).backgroundImage") and J("document.querySelector('#cl3ar-home .h-banner').getBoundingClientRect().height") > 40
    pg.click("#cl3ar-home .h-banner"); pg.wait_for_timeout(50)
    c["home: clicking the banner sends birds up"] = J("document.querySelectorAll('#cl3ar-home .h-bird').length") == 6
    c["home: no prayer rope, no church news list (removed)"] = not J("!!document.querySelector('#cl3ar-home .h-rope')") and "Church news" not in J("document.getElementById('cl3ar-home').innerText")
    c["home: fast foods shown (5 icons)"] = J("document.querySelectorAll('#cl3ar-home .h-food').length") == 5
    c["home: fasting calendar month"] = J("document.querySelectorAll('#cl3ar-home .c-d:not(.c-pad)').length") >= 28 and J("!!document.querySelector('#cl3ar-home .c-today')")
    pg.click("#cl3ar-home [data-cal='1']"); pg.wait_for_timeout(30)
    c["home: calendar turns to next month"] = not J("!!document.querySelector('#cl3ar-home .c-today')")
    pg.click("#cl3ar-home [data-cal='-1']"); pg.wait_for_timeout(30)
    J("(()=>{const m=cl.mods.find(m=>m.ns==='home').inst; m.stop(); m.start(); return 1})()"); pg.wait_for_timeout(120)
    c["home: placed again after a settings restart (stale-box bug)"] = J("(()=>{const h=document.getElementById('cl3ar-home'); return !!h && h.style.width !== '' && h.getBoundingClientRect().width > 200})()")
    was = J("!!document.querySelector('#cl3ar-home .h-reading + .h-text')")
    pg.click("#cl3ar-home .h-reading >> nth=0"); pg.wait_for_timeout(30)
    c["home: a reading opens/closes on click"] = J("!!document.querySelector('#cl3ar-home .h-reading + .h-text')") != was
    pg.locator("#cl3ar-home .h-banner").scroll_into_view_if_needed(); pg.wait_for_timeout(30)
    bb = J("(()=>{const r=document.querySelector('#cl3ar-home .h-banner').getBoundingClientRect(); return [r.left + r.width*0.93, r.top + r.height*0.5]})()")
    pg.mouse.click(bb[0], bb[1]); pg.wait_for_timeout(50)
    c["home: clicking the church rings (chimes rise)"] = J("document.querySelectorAll('#cl3ar-home .h-ding').length") == 5
    if not c["home: clicking the church rings (chimes rise)"]: print("DEBUG church", bb, J(f"(()=>{{const e=document.elementFromPoint({bb[0]},{bb[1]}); return e ? e.tagName+'#'+e.id+'.'+e.className : null}})()"))
    pg.fill("#cl3ar-home .h-pom input[data-list=living]", "John"); pg.press("#cl3ar-home .h-pom input[data-list=living]", "Enter"); pg.wait_for_timeout(30)
    c["home: commemoration name added with Enter, candle lit"] = "John" in J("document.querySelector('#cl3ar-home .h-pom .p-list').textContent") and J("document.querySelectorAll('#cl3ar-home .p-candle').length") >= 1
    c["inbox: search box in the folder pane"] = J("!!document.querySelector('#quietinbox-bar .qi-search input')")
    c["home: verse of the day"] = len(J("(document.querySelector('#cl3ar-home .h-verse')||{}).textContent||''")) > 20
    c["home: banner names the service of the hour"] = any(w in J("document.querySelector('#cl3ar-home .h-banner-l').textContent") for w in ["Office", "Matins", "Hour", "Vespers", "Compline"])
    J("(()=>{const m=cl.mods.find(m=>m.ns==='season').inst; m.away=true; m.apply(); return 1})()")
    c["scene holds still in the background"] = "animate" not in J("getComputedStyle(document.querySelector('section.panels_p')).backgroundImage")
    J("(()=>{const m=cl.mods.find(m=>m.ns==='season').inst; m.away=false; m.apply(); return 1})()")
    c["scene moves again when Discord is in front (Home banner)"] = "animate" in (J("(document.querySelector('#cl3ar-home .h-banner')||{style:{}}).style.backgroundImage||''") or "")
    J("""(()=>{const nav=document.querySelector('nav[class*="privateChannels"]'); const ul=document.createElement('ul'); ul.id='fakedm';
        ul.innerHTML='<li id=r111><a href="/channels/@me/111">kept</a></li><li id=r222><a href="/channels/@me/222">other</a></li>'; nav.appendChild(ul);
        const q=cl.mods.find(m=>m.ns==='inbox').inst; q.lastAllIds=['111','222']; q.star.add('111'); q.tab='favorites'; q.writeNetCss(); return 1})()""")
    c["Favorites by CSS alone: kept row shows, others hide"] = st("#r111", "display") != "none" and st("#r222", "display") == "none"
    J("(()=>{const k=cl.mods.find(m=>m.ns==='sky').inst; k.blurred=false; k.flyNow({force:true,n:3,scale:2}); return 1})()"); pg.wait_for_timeout(2500)
    pos = J("(()=>{const b=[...document.querySelectorAll('#cl3ar-sky .sky-b, [id*=sky] .sky-b')].map(e=>e.getBoundingClientRect()).find(r=>r.left>0&&r.top>0&&r.right<innerWidth); return b?[b.left+b.width/2,b.top+b.height/2]:null})()")
    if pos: pg.mouse.move(pos[0]+40, pos[1]); pg.mouse.move(pos[0]+20, pos[1]); pg.wait_for_timeout(120)
    fea = J("document.querySelectorAll('.sky-f').length")
    fl = J("[...cl.mods.find(m=>m.ns==='sky').inst.flock].filter(d=>d.fleeing).length")
    pg.wait_for_timeout(1600)
    c["doves: the cursor startles them (feathers, flee) and they leave the window fast"] = bool(pos) and fea > 0 and fl >= 1 and J("[...cl.mods.find(m=>m.ns==='sky').inst.flock].filter(d=>d.fleeing).length") == 0
    c["server-bar lampada opens the Favorites folder, not Discord's own"] = J("""(()=>{const q=cl.mods.find(m=>m.ns==='inbox').inst; q.tab='inbox'; let hit=0; const g=document.createElement('div'); g.setAttribute('data-list-item-id','guildsnav___favorites'); const s=document.createElement('span'); g.appendChild(s); g.addEventListener('click',()=>hit++); document.body.appendChild(g); s.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0})); const ok=q.tab==='favorites' && hit===0; g.remove(); q.tab='inbox'; q.refresh(); return ok})()""")
    J("(()=>{const q=cl.mods.find(m=>m.ns==='inbox').inst; q.star.delete('111'); q.tab='inbox'; q.refresh(); document.getElementById('fakedm').remove(); return 1})()")
    pg.fill("#cl3ar-home .h-pom input[data-list=departed]", "Half typ")
    J("(()=>{const m=cl.mods.find(m=>m.ns==='season').inst; m.away=!m.away; m.apply(); m.away=!m.away; m.apply(); return 1})()"); pg.wait_for_timeout(50)
    c["home: a scene change keeps a half-typed name"] = J("document.querySelector('#cl3ar-home .h-pom input[data-list=departed]').value") == "Half typ"
    J("(()=>{const m=cl.mods.find(m=>m.ns==='season').inst; m.settings.season='dormition'; m.apply(); return 1})()"); pg.wait_for_timeout(400)  # headings ease their colour now (.15s)
    c["home: liturgical colour follows the feast (Dormition blue)"] = J("getComputedStyle(document.querySelector('#cl3ar-home h2')).color") == "rgb(111, 154, 216)"
    J("(()=>{const m=cl.mods.find(m=>m.ns==='season').inst; m.settings.season='auto'; m.apply(); return 1})()")
    c["home: cards side by side"] = J("document.querySelectorAll('#cl3ar-home .h-grid > .h-card:not(.h-hidden)').length") >= 5 and J("getComputedStyle(document.querySelector('#cl3ar-home .h-grid')).display") == "grid"
    c["home: prayers + feasts cards"] = J("!!document.querySelector('#cl3ar-home [data-card=prayers]') && !!document.querySelector('#cl3ar-home [data-card=feasts]')")
    c["home: Old Calendar date"] = "29 October" in J("document.getElementById('cl3ar-home').innerText")
    c["home: no OCA lives"] = "lives of the saints" not in J("document.getElementById('cl3ar-home').innerText").lower()
    pg.click("#cl3ar-home .h-sec[data-s=saints]"); pg.wait_for_timeout(30)
    c["home: sections collapse"] = "Anastasia" not in J("document.getElementById('cl3ar-home').innerText")
    pg.click("#cl3ar-home .h-sec[data-s=saints]")
    c["home: world news"] = "World headline one" in J("document.getElementById('cl3ar-home').innerText") and "world news" in J("document.getElementById('cl3ar-home').innerText").lower()
    c["home: no jurisdiction-specific feeds (no sermons or church news)"] = "Sermon on humility" not in J("document.getElementById('cl3ar-home').innerText") and "Memory of Martyr Menas" not in J("document.getElementById('cl3ar-home').innerText")
    # St Demetrius: every outside link opens in the user's browser through window.open (Discord's window hands it to the system browser); Discord itself stays put
    J("window.__opened=[]; window.open=(...a)=>{__opened.push(a); return null}; window.__urls=[]; (()=>{const f=BdApi.Net.fetch; BdApi.Net.fetch=(u,...r)=>{__urls.push(u); return f(u,...r)}})()")
    href0, pages0 = J("location.href"), len(pg.context.pages)
    pg.click("#cl3ar-home .h-news a >> text=World headline one"); pg.wait_for_timeout(80)
    c["home: a news link opens in the browser (window.open), Discord stays"] = J("__opened") == [["https://www.bbc.co.uk/news/1", "_blank", "noopener,noreferrer"]] and J("location.href") == href0 and len(pg.context.pages) == pages0
    pg.click("#cl3ar-home [data-card=saints] a.h-life >> nth=0"); pg.wait_for_timeout(80)
    c["home: each saint leads to their life (opens in the browser)"] = J("document.querySelectorAll('#cl3ar-home [data-card=saints] a.h-life').length") == 3 and len(J("__opened")) == 2 and J("__opened[1][0]").startswith("https://") and len(pg.context.pages) == pages0
    pg.click("#cl3ar-home .h-cal .c-today"); pg.wait_for_timeout(30)
    c["home: clicking a calendar day shows that day"] = J("!!document.querySelector('#cl3ar-home .c-info') && !!document.querySelector('#cl3ar-home .c-today.c-sel')")
    pg.click("#cl3ar-home .h-cal .c-today"); pg.wait_for_timeout(30)
    c["home: clicking the day again closes it"] = not J("!!document.querySelector('#cl3ar-home .c-info')")
    c["home: the calendar asks orthocal for its month"] = any(__import__("re").search(r"orthocal\.info/api/julian/\d+/\d+/$", u) for u in J("__urls")) or J("cl.mods.find(m=>m.ns==='home').inst.months.size") > 0
    pg.click("#cl3ar-home .h-sec[data-s=world]"); pg.wait_for_timeout(30)
    c["home: a folded card says how much it holds"] = bool(__import__("re").search(r"\(\d+\)", J("document.querySelector('#cl3ar-home .h-sec[data-s=world]').textContent")))
    pg.click("#cl3ar-home .h-sec[data-s=world]"); pg.wait_for_timeout(30)
    c["home: a heading's underline sits below its pixel icon"] = J("[...document.querySelectorAll('#cl3ar-home h2:has(.h-ico)')].every(h=>{const i=h.querySelector('.h-ico').getBoundingClientRect(), r=h.getBoundingClientRect(); return i.bottom <= r.bottom - parseFloat(getComputedStyle(h).borderBottomWidth) + .5})")
    J("document.getElementById('cl3ar-home').scrollTop=0; cl.mods.find(m=>m.ns==='home').inst.openCalendar()"); pg.wait_for_timeout(700)
    c["the date in the bottom panel leads to the calendar (in view, glowing)"] = J("(()=>{const c=document.querySelector('#cl3ar-home .h-cal'); const k=c&&(c.closest('.h-card')||c); if(!k) return false; const r=k.getBoundingClientRect(), h=document.getElementById('cl3ar-home').getBoundingClientRect(); return k.classList.contains('h-flash') && r.top < h.bottom && r.bottom > h.top})()")
    IN = "cl.mods.find(m=>m.ns==='inbox').inst"
    c["pinned people stay in the server bar (Discord's DM bubble list gets them)"] = J(f"(()=>{{const q={IN}; const was=new Set(q.star); q.star.add('c1'); const out=q.withPinned(['zz']); q.star=was; return out[0]==='c1' && out.includes('zz')}})()")
    c["each DM name ends with its status dot"] = J(f"(()=>{{const q={IN}; q.PresenceStore={{getStatus:()=>'idle'}}; const ids=q.lastAllIds, rc=q.recipientOf; q.lastAllIds=['123456789012345678']; q.recipientOf=()=>'876543210987654321'; const css=q.statusCss(); q.lastAllIds=ids; q.recipientOf=rc; return css.includes('nameAndDecorators')&&css.includes('#f0b232')}})()")
    HM = "cl.mods.find(m=>m.ns==='home').inst"
    c["settings: Church calendar Old / New, Old by default (home.settings.calendar)"] = J(f"(()=>{{const s={HM}.getSettingsPanel().settings.find(s=>s.id==='calendar'); return !!s && s.value==='old' && s.options.map(o=>o.value).join()==='old,new'}})()") and J("__data['Cl3ar_orthodox_discordhome.settings'].calendar") == "old"
    J(f"addEventListener('cl3ar:calendar', e=>window.__calEv=e.detail); addEventListener('cl3ar:settings', ()=>window.__setEv=(window.__setEv||0)+1); __urls.length=0; {HM}.getSettingsPanel().onChange(null,'calendar','new')"); pg.wait_for_timeout(300)
    c["New Calendar: header, orthocal's Gregorian day, event for the scene"] = "(New Calendar)" in J("document.querySelector('#cl3ar-home .h-date').textContent") and "Old Calendar" not in J("document.querySelector('#cl3ar-home .h-date').textContent") and any("/api/gregorian/" in u for u in J("__urls")) and J("window.__calEv") == "new" and J("window.__setEv") == 1 and J("__data['Cl3ar_orthodox_discordhome.settings'].calendar") == "new"
    J(f"{HM}.getSettingsPanel().onChange(null,'calendar','old')"); pg.wait_for_timeout(300)
    c["Old Calendar again: 29 October (Old Calendar)"] = "29 October (Old Calendar)" in J("document.querySelector('#cl3ar-home .h-date').textContent")
    c["no Friends row in the DM list"] = st("#frow","display") == "none"
    c["friends hidden + header hidden"] = st("#people", "display") == "none" and st("#fhdr", "display") == "none"
    pg.click("#cl3ar-home .h-friends"); pg.wait_for_timeout(50)
    c["Friends button shows friends, hides home"] = st("#people", "display") != "none" and st("#cl3ar-home", "display") == "none" and J("!!document.getElementById('cl3ar-friends-close')")
    c["Friends list shows profile pictures"] = st("#fpic","display") != "none"
    pg.click("#cl3ar-friends-close"); pg.wait_for_timeout(50)
    c["Home button closes friends"] = st("#people", "display") == "none" and st("#cl3ar-home", "display") != "none"
    c["DM list keeps its full height (grid untouched)"] = J("document.querySelector('nav.privateChannels_x').getBoundingClientRect().height") > 600 and J("document.querySelector('.content_c').children.length") == 2
    c["home: Orthodox Today covers the page area"] = st("#cl3ar-home","display") == "block" and abs(J("document.getElementById('cl3ar-home').getBoundingClientRect().left") - 540) < 2 and J("document.getElementById('cl3ar-home').getBoundingClientRect().width") > 800
    # open a DM: list area becomes the gold chat box, Orthodox Today stays on the right
    J("history.pushState({},'','/channels/@me/c1'); __stores.SelectedChannelStore.getChannelId=()=>'c1'; cl.mods.forEach(m=>{m.inst.updateFocus?.(); m.inst.mount?.();})")
    pg.wait_for_timeout(50)
    pw_ = J("document.getElementById('page').getBoundingClientRect().width")
    c["DM: chat starts at the left edge"] = J("document.getElementById('page').getBoundingClientRect().left") < 2
    c["DM: chat in the gold box (540px)"] = abs(pw_ - 540) < 2 and "201, 162, 74" in st("#page","outlineColor") and st("#sidebar","display") == "none"
    c["DM: Orthodox Today still beside it"] = st("#cl3ar-home","display") == "block" and abs(J("document.getElementById('cl3ar-home').getBoundingClientRect().left") - 540) < 2
    c["DM: back + full-screen buttons"] = st("#qi-back","display") != "none" and st("#cl3ar-full","display") != "none"
    c["gold box: buttons kept, search hidden"] = st("#tvoice","display") != "none" and st("#tvideo","display") != "none" and st("#tpin","display") != "none" and st("#tsearch","display") == "none"
    c["no picture circle by the name"] = st("#havatar","display") == "none"
    c["Inbox button readable (light text)"] = st("#qi-back","color") == "rgb(232, 232, 232)" and st("#qi-back","backgroundColor") == "rgb(30, 30, 30)"
    c["full-screen button is an icon"] = J("!!document.querySelector('#cl3ar-full svg')") and J("document.getElementById('cl3ar-full').textContent.trim()") == ""
    pg.click("#cl3ar-full"); pg.wait_for_timeout(50)
    c["full screen: search back"] = st("#tsearch","display") != "none"
    c["Full screen: chat fills, home hidden"] = J("document.getElementById('page').getBoundingClientRect().width") > 1000 and st("#cl3ar-home","display") == "none" and J("document.getElementById('cl3ar-full').title") == "Split view"
    pg.click("#cl3ar-full"); pg.wait_for_timeout(50)
    c["Split view again"] = abs(J("document.getElementById('page').getBoundingClientRect().width") - 540) < 2
    pg.screenshot(path=str(T / "bundlecheck-dm.png"))
    c["server list scroll ends above the panel"] = J("parseInt(getComputedStyle(document.getElementById('gscroll')).paddingBottom)") >= 60
    c["season pixel art behind the bottom bar (under the bevel and red keys)"] = "data:image/svg+xml" in st("section.panels_p","backgroundImage") and "shape-rendering" in st("section.panels_p","backgroundImage")
    c["bottom panel fills its whole space"] = J("(()=>{const p=document.querySelector('section.panels_p').getBoundingClientRect(),s=document.getElementById('sidebar').getBoundingClientRect();return Math.abs(p.left-s.left)<1&&Math.abs(p.right-s.right)<1&&Math.abs(p.bottom-s.bottom)<1})()") and st("section.panels_p","borderTopLeftRadius") == "0px"
    c["panel is solid, layout untouched"] = st("section.panels_p", "position") == "absolute" and (st("section.panels_p", "backgroundColor") not in ("rgba(0, 0, 0, 0)", "transparent") or "svg" in st("section.panels_p", "backgroundImage"))
    c["Orthodox note beside the buttons"] = "(O.S.)" not in J("document.getElementById('cl3ar-note')?.textContent || ''") and "Anastasia" not in J("document.getElementById('cl3ar-note').textContent") and __import__("re").search(r"\d{1,2}:\d{2}", J("document.getElementById('cl3ar-note').textContent")) is not None and st("#cl3ar-note", "display") != "none"
    c["no white unread pill"] = st("#pill", "display") == "none"
    c["icon behind chat blurred"] = "blur(14px)" in J("getComputedStyle(document.getElementById('msgs'),'::before').filter") and st("#msgs", "backgroundImage") == "none"
    c["no big background picture"] = st("html", "backgroundImage") == "none"
    c["bottom panel: account button invisible"] = st("#acct", "opacity") == "0" and J("document.getElementById('acct').getBoundingClientRect().width") <= 1
    pg.click("#cl3ar-home .h-status")
    c["Status button under Friends opens Discord's status menu"] = J("window.__statusOpened === 1")
    c["settings: 8 sections"] = J("cl.getSettingsPanel().settings.map(s=>s.id)") == ["theme", "inbox", "profiles", "home", "servers", "season", "sky", "sounds"]
    c["no script errors"] = not errs
    print("rows:", r2)
    print("errors:", errs[:3])
    # a full-length picture of the home page (after all checks; changes the layout)
    pg.goto("about:blank") if False else None
    J("(()=>{document.body.classList.remove('qi-focus','cl3ar-chat-full'); const h=document.getElementById('cl3ar-home'); h.style.cssText+=';position:absolute;height:auto;overflow:visible;left:0;top:0;width:1100px;display:block'; return 1})()")
    pg.set_viewport_size({"width": 1100, "height": max(800, J("document.getElementById('cl3ar-home').scrollHeight"))})
    pg.locator("#cl3ar-home").screenshot(path=str(T / "home-full.png"))
    b.close()
for k, v in c.items():
    print(("PASS " if v else "FAIL ") + k)
sys.exit(0 if all(c.values()) else 1)
