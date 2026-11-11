import sys, pathlib
from playwright.sync_api import sync_playwright
S, P, EXE = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3]
bundle = (P/"dist"/"Cl3ar_orthodox_discord.plugin.js").read_text(encoding="utf-8")
html = """<html><head><style>:root{--nx-icon-panto:url("data:image/png;base64,PANTO")}</style></head><body><div id="app-mount">
<nav class="privateChannels_x"><div class="scroller_s"><ul><li><a href="/channels/@me/c1">dm</a></li></ul></div></nav>
<section class="title_t" id="hdr"><div role="tablist"><div role="tab">Online</div></div></section>
<div class="tabBody_z" id="tb"><div class="peopleColumn_1" id="people">list</div><div class="nowPlayingColumn_2" id="active">now</div></div>
</div></body></html>"""
harness = r"""
window.module = {exports:null};
const styles={}, data={};
const store=o=>Object.assign({emitChange(){},addChangeListener(){},removeChangeListener(){}},o);
const chans={c1:{id:"c1",type:1,recipients:["u1"]}, c2:{id:"c2",type:1,recipients:["u2"]}};
const stores={ ChannelStore:store({getChannel:id=>chans[id]}), UserStore:store({getCurrentUser:()=>({id:"999999999999999999"}),_dispatcher:{_interceptors:[],subscribe(){},unsubscribe(){}}}),
 RelationshipStore:store({isIgnored:u=>u==="u2",isBlocked:()=>false,isFriend:()=>true,getIgnoredIDs:()=>["u2"],getBlockedIDs:()=>[]}),
 SelectedChannelStore:store({getChannelId:()=>null}), PrivateChannelSortStore:store({getPrivateChannelIds:()=>["c1","c2"]}) };
window.BdApi={ Data:{load:(n,k)=>data[n+k],save:(n,k,v)=>{data[n+k]=v}}, Webpack:{getStore:n=>stores[n],Filters:{byKeys:()=>null},waitForModule:()=>new Promise(()=>{}),getByKeys:()=>null},
 Patcher:{after(n,o,m,cb){const f=o[m];o[m]=function(...a){return cb(this,a,f.apply(this,a))}},instead(){},unpatchAll(){}},
 ContextMenu:{patch:()=>()=>{},buildItem:x=>x}, React:{createElement:(...a)=>a}, DOM:{addStyle:(id,c)=>{let s=document.getElementById("s-"+id)||document.head.appendChild(Object.assign(document.createElement("style"),{id:"s-"+id}));s.textContent=c}, removeStyle:id=>document.getElementById("s-"+id)?.remove()}, UI:{buildSettingsPanel:()=>null} };
window.__stores=stores; window.__data=data;
"""
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=EXE); pg = b.new_page(); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.set_content(html); pg.evaluate(harness)
    pg.evaluate("(src)=>{ new Function('module', src)(window.module); window.cl=new window.module.exports({name:'Cl3ar_orthodox_discord'}); window.cl.start(); window.qi=window.cl.mods.find(m=>m.ns==='inbox').inst; }", bundle)
    pg.wait_for_timeout(100)
    opts = pg.evaluate("[...document.querySelectorAll('#quietinbox-bar .qi-f .qi-l')].map(o=>o.textContent)")
    pg.click("#quietinbox-bar .qi-f[data-tab=ignored]"); pg.wait_for_timeout(50)
    after = pg.evaluate("({tab: qi.tab, ids: __stores.PrivateChannelSortStore.getPrivateChannelIds(), sel: document.querySelector('#quietinbox-bar .qi-on').dataset.tab})")
    pg.evaluate("window.BdApi.UI.buildSettingsPanel = c => c")
    panel = pg.evaluate("cl.getSettingsPanel().settings.map(c=>c.id)")
    pg.evaluate("cl.mods.find(m=>m.ns==='inbox').inst.star.add('c1'); cl.mods.find(m=>m.ns==='inbox').inst.save()")
    keys = pg.evaluate("Object.keys(__data)")
    st = lambda i,p: pg.evaluate(f"getComputedStyle(document.getElementById('{i}')).{p}")
    checks = {
      "folder pane has 8 folders": opts == ["Inbox","Favorites","Unread","Snoozed","Archive","Spam","Ignored","Blocked"],
      "choosing Ignored shows the ignored DM": after["tab"]=="ignored" and after["ids"]==["c2"] and after["sel"]=="ignored",
      "friends list hidden": st("people","display")=="none" and st("active","display")=="none",
      "no script errors": not errs,
      "one settings page, 8 sections": panel == ["theme","inbox","profiles","home","servers","season","sky","sounds"],
      "data stored in the one plugin": any(k.startswith("Cl3ar_orthodox_discordinbox.") for k in keys),
    }
    print("options:", opts, "| after:", after, "| errors:", errs[:3])
    b.close()
for k,v in checks.items(): print(("PASS " if v else "FAIL ")+k)
sys.exit(0 if all(checks.values()) else 1)
