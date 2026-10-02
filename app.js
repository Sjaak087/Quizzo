import {db, ref, get, set, update, remove, push, onValue, serverTimestamp} from "./firebase.js";

window.__quizzoStarted = true;

const $=s=>document.querySelector(s),A=$("#app"),COL=["r","b","y","g"],SYM=["▲","◆","●","■"];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=x=>Array.isArray(x)?x:Object.values(x||{});

// Centrale app-state: declared before any event handlers use it.
const act={};
let user=null, offset=0, unsub=null, timer=null;
let G=null, CODE="", HOST=false, busy=false, lastKey="";
let scoreSnapshot={}, rankSnapshot={}, boardAnim=null, lastPaintState="";
let Q=null, QID=null, ADMIN_EDIT=null, joinCode=null, SEL=-1, tab="join", mode="login";

// Core utility helpers used throughout the app.
const now=()=>Date.now()+Number(offset||0);
const em=e=>String(e?.message||e||"Onbekende fout");
function toast(message){
  const old=document.querySelectorAll(".toast");
  old.forEach(x=>x.remove());
  const el=document.createElement("div");
  el.className="toast";
  el.textContent=String(message??"");
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),3200);
}

// Centrale cleanup-functie: altijd veilig aan te roepen vanuit home(), run() en andere views.
function cleanup(){
  try{ if(typeof unsub === "function") unsub(); }catch(e){}
  unsub=null;
  try{ if(timer!=null) clearInterval(timer); }catch(e){}
  timer=null;
  G=null;
  CODE="";
  HOST=false;
  busy=false;
  lastKey="";
  scoreSnapshot={};
  rankSnapshot={};
  boardAnim=null;
  lastPaintState="";
}
const THEMES={
 classic:{name:"Quizzo Klassiek",icon:"🎉"},
 winter:{name:"Winter",icon:"❄️"},
 christmas:{name:"Kerst",icon:"🎄"},
 spring:{name:"Lente",icon:"🌸"},
 summer:{name:"Zomer",icon:"☀️"},
 autumn:{name:"Herfst",icon:"🍂"},
 classroom:{name:"Classroom",icon:"📚"},
 ocean:{name:"Oceaan",icon:"🌊"},
 space:{name:"Ruimte",icon:"🚀"},
 jungle:{name:"Jungle",icon:"🌿"},
 sunset:{name:"Zonsondergang",icon:"🌅"},
 candy:{name:"Candy",icon:"🍭"},
 neon:{name:"Neon",icon:"⚡"},
 sports:{name:"Sport",icon:"🏆"},
 football:{name:"Voetbal",icon:"⚽"},
 basketball:{name:"Basketbal",icon:"🏀"},
 racing:{name:"Racing",icon:"🏎️"},
 gaming:{name:"Gaming",icon:"🎮"},
 music:{name:"Muziek",icon:"🎵"},
 halloween:{name:"Halloween",icon:"🎃"},
 party:{name:"Party",icon:"🎊"},
 rainbow:{name:"Rainbow",icon:"🌈"},
 arcade:{name:"Arcade",icon:"🕹️"},
 volcano:{name:"Vulkaan",icon:"🌋"},
 study:{name:"Study",icon:"✏️"}
};
const themeIds=Object.keys(THEMES);
const THEME_FILES=Object.fromEntries(themeIds.map(id=>[id,id==="classic"?"classic.png":`${id}.jpg`]));
const APP_ROOT=new URL("./",import.meta.url);
const projectAsset=path=>new URL(String(path||"").replace(/^\.\//,""),APP_ROOT).href;
const safeTheme=t=>themeIds.includes(t)?t:"classic";
function themeSources(id){
  const file=THEME_FILES[safeTheme(id)];
  return file?[projectAsset(`themes/${file}`)]:[];
}
function themeAsset(id){return themeSources(id)[0]||"";}
function setThemeImageWithFallback(img,id){
  if(!img)return;
  const src=themeAsset(id);
  img.classList.remove("asset-missing");
  img.onerror=()=>{img.onerror=null;img.removeAttribute("src");img.classList.add("asset-missing");};
  img.src=src;
}
function wireThemePreviews(){
  document.querySelectorAll('.theme-choice-thumb[data-theme]').forEach(img=>setThemeImageWithFallback(img,img.dataset.theme));
}
function applyTheme(t){
  const id=safeTheme(t);
  const root=document.documentElement,body=document.body;
  body.classList.remove(...themeIds.map(x=>"theme-"+x),"has-theme-scene");
  body.classList.add("theme-"+id);
  // The real raster theme is applied directly to <body>. This avoids an extra image layer,
  // stale scene nodes and bad document.baseURI paths on GitHub Pages/sub-routes.
  if(id==="classic"){
    body.style.setProperty("background","radial-gradient(circle at 10% 8%,#6e35cc 0,transparent 38%),radial-gradient(circle at 92% 88%,#8e3be4 0,transparent 40%),linear-gradient(135deg,#321066,#641f9e)","important");
    body.style.setProperty("background-size","auto,auto,cover","important");
    body.style.setProperty("background-position","center","important");
    body.style.setProperty("background-attachment","fixed","important");
    root.style.setProperty("--quiz-theme","none");
  }else{
    const src=themeAsset(id);
    body.style.setProperty("background-image",`url("${src}")`,"important");
    body.style.setProperty("background-repeat","no-repeat","important");
    body.style.setProperty("background-position","center center","important");
    body.style.setProperty("background-size","cover","important");
    body.style.setProperty("background-attachment","fixed","important");
    body.style.setProperty("background-color","#17132f","important");
    root.style.setProperty("--quiz-theme",`url("${src}")`);
  }
  document.getElementById("quizzo-theme-scene")?.remove();
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta){const colors={classic:"#46178f",winter:"#2463a6",christmas:"#a51d35",spring:"#c85f8e",summer:"#f29b2f",autumn:"#a95f2c",classroom:"#34593f",ocean:"#0b668e",space:"#24164e",jungle:"#247447",sunset:"#bd5332",candy:"#cf4b9c",neon:"#241044",sports:"#14532d",football:"#1f6b45",basketball:"#a64b1e",racing:"#b51f3a",gaming:"#2b1c56",music:"#6130a6",halloween:"#2f153f",party:"#8b2bb4",rainbow:"#5b4bd8",arcade:"#12336e",volcano:"#7e2318",study:"#6b4f2d"};meta.setAttribute("content",colors[id]||colors.classic)}
}

/* QUIZZO V72 — Kahoot-style participant characters using original Quizzo assets. */
let QUIZZO_AVATAR_CATALOG = window.QUIZZO_AVATAR_CATALOG || {avatars:[],accessories:[]};
let AVATAR_COUNT = QUIZZO_AVATAR_CATALOG.avatars.length || 1;
let ACCESSORY_COUNT = QUIZZO_AVATAR_CATALOG.accessories.length || 0;
let AVATAR_NAMES = QUIZZO_AVATAR_CATALOG.avatars.map(x=>x?.name||"Avatar");
let ACCESSORY_NAMES = QUIZZO_AVATAR_CATALOG.accessories.map(x=>x?.name||"Accessoire");

function refreshAvatarCatalog(){
  QUIZZO_AVATAR_CATALOG = window.QUIZZO_AVATAR_CATALOG || QUIZZO_AVATAR_CATALOG || {avatars:[],accessories:[]};
  AVATAR_COUNT = Math.max(1, QUIZZO_AVATAR_CATALOG.avatars?.length || 0);
  ACCESSORY_COUNT = Math.max(0, QUIZZO_AVATAR_CATALOG.accessories?.length || 0);
  AVATAR_NAMES = (QUIZZO_AVATAR_CATALOG.avatars||[]).map(x=>x?.name||"Avatar");
  ACCESSORY_NAMES = (QUIZZO_AVATAR_CATALOG.accessories||[]).map(x=>x?.name||"Accessoire");
}

async function ensureAvatarCatalog(){
  if(window.QUIZZO_AVATAR_CATALOG?.avatars?.length){ refreshAvatarCatalog(); return true; }
  // Give an existing avatars.js script a chance to finish before loading a fallback.
  const deadline=Date.now()+2500;
  while(Date.now()<deadline){
    if(window.QUIZZO_AVATAR_CATALOG?.avatars?.length){ refreshAvatarCatalog(); return true; }
    await new Promise(r=>setTimeout(r,50));
  }
  // Load avatars.js ourselves as a final GitHub Pages-safe fallback.
  try{
    const existing=document.querySelector('script[src*="avatars.js"]');
    if(!existing){
      await new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src=new URL('./avatars.js?quizzo-cache=72',import.meta.url).href;
        s.async=false;
        s.onload=resolve; s.onerror=reject;
        document.head.appendChild(s);
      });
    }else{
      await new Promise(r=>setTimeout(r,300));
    }
  }catch(e){
    console.warn('Quizzo: avatars.js kon niet automatisch worden geladen',e);
  }
  refreshAvatarCatalog();
  return !!window.QUIZZO_AVATAR_CATALOG?.avatars?.length;
}
const DEFAULT_PROFILE = {avatar:0, accessory:null};
const clampIndex=(v,max)=>{const n=Number(v);return Number.isInteger(n)&&n>=0&&n<max?n:0};
const normalizeAccessory=v=>{if(v===null||v===undefined||v===""||v===-1||v==="-1")return null;const n=Number(v);return Number.isInteger(n)&&n>=0&&n<ACCESSORY_COUNT?n:null};
const normalizeProfile=p=>({avatar:clampIndex(p?.avatar,AVATAR_COUNT),accessory:normalizeAccessory(p?.accessory)});
const randProfile=()=>({avatar:Math.floor(Math.random()*AVATAR_COUNT),accessory:null});
const assetUrl=src=>{
  try{
    let raw=String(src||"").trim();
    if(!raw)return "";
    if(/^data:|^blob:|^https?:/i.test(raw))return raw;
    return projectAsset(raw);
  }catch(_){return src||""}
};
const avatarAssetUrl=i=>projectAsset(`avatars/avatar-${clampIndex(i,AVATAR_COUNT)}.webp`);
const accessoryAssetUrl=i=>projectAsset(`avatars/accessory-${Math.max(0,Number(i)||0)}.webp`);

/*
  Accessories are drawn over the original 512x512 avatar canvas.  The source
  character images already share that exact canvas size, so the preview and
  in-game character use the same coordinate system at every CSS size.
*/
const WEARABLES={};
function wearableDef(name,item){
  const n=String(name||"").toLowerCase();
  if(item?.fit)return item.fit;
  if(/cape|vleugel/.test(n))return {kind:"back",wFactor:1.08,hFactor:.75,topOffset:-18,z:1};
  if(/sjaal/.test(n))return {kind:"neck",wFactor:.72,hFactor:.42,topOffset:-18,z:7};
  if(/strik/.test(n))return {kind:"neck",wFactor:.42,hFactor:.24,topOffset:-10,z:7};
  if(/bandana/.test(n))return {kind:"face",wFactor:.84,hFactor:.30,topOffset:-10,z:7};
  if(/bril|masker/.test(n))return {kind:"face",wFactor:.80,hFactor:.26,topOffset:-3,z:7};
  if(/koptelefoon|oor/.test(n))return {kind:"ears",wFactor:1.12,hFactor:.72,topOffset:-52,z:5};
  if(/halo/.test(n))return {kind:"halo",wFactor:.94,hFactor:.30,topOffset:-44,z:5};
  return {kind:"head",wFactor:1,hFactor:.60,topOffset:-2,z:6};
}
function accessoryPlacement(avatarIdx,accessoryIdx){
  const av=QUIZZO_AVATAR_CATALOG.avatars[clampIndex(avatarIdx,AVATAR_COUNT)]||{};
  const ac=QUIZZO_AVATAR_CATALOG.accessories[clampIndex(accessoryIdx,ACCESSORY_COUNT)]||{};
  const m=av.metrics||{},fit=wearableDef(ac.name,ac);
  const W=Math.max(1,Number(ac.w)||93),H=Math.max(1,Number(ac.h)||79);
  const bb=Array.isArray(ac.bbox)&&ac.bbox.length===4?ac.bbox:[0,0,W,H];
  const bx0=Math.max(0,Number(bb[0])||0),by0=Math.max(0,Number(bb[1])||0);
  const bx1=Math.min(W,Math.max(bx0+1,Number(bb[2])||W)),by1=Math.min(H,Math.max(by0+1,Number(bb[3])||H));
  const visW=Math.max(1,bx1-bx0),visH=Math.max(1,by1-by0);
  const headX=Number(m.headX)||256,headW=Number(m.headW)||220,headTop=Number(m.headTop)||40;
  const faceY=Number(m.faceY)||175,neckY=Number(m.neckY)||275,bodyX=Number(m.bodyX)||256,bodyW=Number(m.bodyW)||220;
  const bodyTop=Number(m.bodyTop)||80,bodyBottom=Number(m.bodyBottom)||470;
  const headH=Math.max(80,faceY-headTop),neckH=Math.max(80,bodyBottom-neckY);
  let targetW=headW*Number(fit.wFactor||1),targetH=headH*Number(fit.hFactor||.6),centerX=headX,targetTop=headTop+Number(fit.topOffset||0),z=Number(fit.z)||6;
  if(fit.kind==="face"){
    targetW=headW*Number(fit.wFactor||.8);targetH=Math.max(24,headH*Number(fit.hFactor||.26));centerX=headX;targetTop=faceY-targetH*.5+Number(fit.topOffset||0);z=7;
  }else if(fit.kind==="ears"){
    targetW=headW*Number(fit.wFactor||1.12);targetH=Math.max(36,headH*Number(fit.hFactor||.72));centerX=headX;targetTop=faceY-targetH*.72+Number(fit.topOffset||0);z=5;
  }else if(fit.kind==="neck"){
    targetW=bodyW*Number(fit.wFactor||.7);targetH=Math.max(34,neckH*Number(fit.hFactor||.35));centerX=bodyX;targetTop=neckY+Number(fit.topOffset||-12);z=7;
  }else if(fit.kind==="back"){
    targetW=bodyW*Number(fit.wFactor||1.08);targetH=Math.max(70,neckH*Number(fit.hFactor||.75));centerX=bodyX;targetTop=bodyTop+Number(fit.topOffset||0);z=1;
  }else if(fit.kind==="halo"){
    targetW=headW*Number(fit.wFactor||.94);targetH=Math.max(22,headH*Number(fit.hFactor||.30));centerX=headX;targetTop=headTop+Number(fit.topOffset||-44);z=5;
  }
  targetW=Math.max(24,Math.min(430,targetW));targetH=Math.max(18,Math.min(360,targetH));
  const renderedW=targetW*W/visW,renderedH=targetH*H/visH;
  let left=centerX-(((bx0+bx1)/2)/W)*renderedW;
  let top=targetTop-(by0/H)*renderedH;
  const angle=Number(ac.angle||0);
  return {left:left/512*100,top:top/512*100,width:renderedW/512*100,height:renderedH/512*100,z,angle,kind:fit.kind};
}
function avatarSvg(i){
  const idx=clampIndex(i,AVATAR_COUNT);
  return `<img class="avatar-main-img" src="${esc(avatarAssetUrl(idx))}" alt="" aria-hidden="true" draggable="false" decoding="async" loading="eager">`;
}
function accessorySvg(i,avatar=0,preview=false){
  const idx=normalizeAccessory(i),item=idx===null?null:QUIZZO_AVATAR_CATALOG.accessories[idx];
  if(!item)return "";
  const src=esc(accessoryAssetUrl(idx));
  if(preview)return `<img class="accessory-art-img" src="${src}" alt="${esc(item.name||`Accessoire ${idx+1}`)}" draggable="false" decoding="async" loading="eager">`;
  const p=accessoryPlacement(avatar,idx);
  return `<img class="avatar-accessory-img accessory-${idx}" src="${src}" alt="" aria-hidden="true" draggable="false" decoding="async" loading="eager" style="left:${p.left}%;top:${p.top}%;width:${p.width}%;height:${p.height}%;z-index:${p.z};transform:rotate(${p.angle}deg);">`;
}
function avatarReaction(emotion){
  const map={happy:["✨","Goed!"],celebrate:["🎉","Winnaar!"],sad:["💧","Oei!"],rankup:["⬆️","Omhoog!"],overtaken:["😵","Ingehaald!"]};
  const v=map[emotion];return v?`<span class="avatar-reaction reaction-${emotion}" aria-hidden="true"><b>${v[0]}</b><small>${v[1]}</small></span>`:"";
}
function avatarMarkup(p,size=48,emotion=""){
  const v=normalizeProfile(p),e=emotion||"";
  const acc=v.accessory===null?"":accessorySvg(v.accessory,v.avatar);
  const kind=v.accessory===null?null:wearableDef(ACCESSORY_NAMES[v.accessory],QUIZZO_AVATAR_CATALOG.accessories[v.accessory]).kind;
  const back=kind==="back"?acc:"",front=kind==="back"?"":acc;
  return `<span class="avatar-inline ${e?`mood-${e}`:""}" style="--avatar-size:${size}px"><span class="avatar-back-accessory">${back}</span><span class="avatar-svg">${avatarSvg(v.avatar)}</span><span class="avatar-accessory">${front}</span>${avatarReaction(e)}</span>`;
}
function savedProfile(){try{return normalizeProfile(JSON.parse(localStorage.getItem("quizzo_avatar")||"null"))}catch(_){return {...DEFAULT_PROFILE}}}
function saveProfile(p){localStorage.setItem("quizzo_avatar",JSON.stringify(normalizeProfile(p)))}

let avatarPickerCallback=null,avatarDraft={...DEFAULT_PROFILE},avatarPickerSearch="",avatarPickerTab="avatars";
function accessoryChoiceMarkup(){
  const items=[`<button class="accessory-option none-option ${avatarDraft.accessory===null?"selected":""}" data-a="pickAvatar" data-kind="accessory" data-index="-1"><span class="accessory-option-art"><span class="no-accessory-character">${avatarMarkup({avatar:avatarDraft.avatar,accessory:null},92)}</span></span><span>Geen accessoire</span><small>Standaard</small></button>`];
  for(let i=0;i<ACCESSORY_COUNT;i++){
    const a=QUIZZO_AVATAR_CATALOG.accessories[i]||{};
    if(avatarPickerSearch&&!String(a.name||"").toLowerCase().includes(avatarPickerSearch.toLowerCase()))continue;
    items.push(`<button class="accessory-option ${i===avatarDraft.accessory?"selected":""}" data-a="pickAvatar" data-kind="accessory" data-index="${i}" aria-label="${esc(a.name||`Accessoire ${i+1}`)}"><span class="accessory-option-art"><span class="catalog-character">${avatarMarkup({avatar:avatarDraft.avatar,accessory:i},92)}</span></span><span>${esc(a.name||`Accessoire ${i+1}`)}</span><small>${esc(wearableDef(a.name,a).kind)}</small></button>`);
  }
  return items.join("");
}
function avatarChoiceMarkup(){
  const items=[];
  for(let i=0;i<AVATAR_COUNT;i++){
    const a=QUIZZO_AVATAR_CATALOG.avatars[i]||{};
    if(avatarPickerSearch&&!String(a.name||"").toLowerCase().includes(avatarPickerSearch.toLowerCase()))continue;
    items.push(`<button class="avatar-option ${i===avatarDraft.avatar?"selected":""}" data-a="pickAvatar" data-kind="avatar" data-index="${i}" aria-label="${esc(a.name||`Avatar ${i+1}`)}"><span class="avatar-option-art">${avatarSvg(i)}</span><strong>${esc(a.name||`Avatar ${i+1}`)}</strong><small>Personage</small></button>`);
  }
  return items.join("");
}
function openAvatarPicker(initial,done,title="Kies je avatar"){
  avatarDraft=normalizeProfile(initial);avatarPickerCallback=done;avatarPickerSearch="";avatarPickerTab="avatars";
  document.querySelector('.avatar-modal')?.remove();
  const m=document.createElement("div");m.className="avatar-modal avatar-modal-full";
  m.innerHTML=`<div class="avatar-picker-screen">
    <header class="avatar-picker-top">
      <div class="avatar-top-brand"><span class="avatar-top-icon">🐾</span><div><span class="eyebrow">QUIZZO</span><h1>${esc(title)}</h1><p>Kies eerst je personage. Daarna kun je een accessoire kiezen.</p></div></div>
      <div class="avatar-top-actions"><span class="avatar-phone-badge">📱 Telefoon ondersteund</span><button class="avatar-close-btn" data-a="closeAvatarPicker" aria-label="Sluiten">×</button></div>
    </header>
    <main class="avatar-picker-main">
      <section class="avatar-showcase-panel">
        <div class="showcase-label">JOUW PERSONAGE</div>
        <div class="showcase-stage" id="avatarLive">${avatarMarkup(avatarDraft,275)}</div>
        <div class="showcase-name"><strong id="avatarLiveName">${esc(AVATAR_NAMES[avatarDraft.avatar]||"Avatar")}</strong><span id="avatarLiveAccessory">${esc(avatarDraft.accessory===null?"Geen accessoire":ACCESSORY_NAMES[avatarDraft.accessory]||"Accessoire")}</span></div>
        <div class="mood-strip"><span class="mood-pill">🙂 Standaard</span><span class="mood-pill">✨ Goed antwoord</span><span class="mood-pill">⬆️ Rank-up</span><span class="mood-pill">🎉 Winnaar</span></div>
        <div class="showcase-tip">✨ Dezelfde character verschijnt in de lobby, naast de naam, op het leaderboard en op het podium.</div>
      </section>
      <section class="avatar-catalog-panel">
        <div class="catalog-toolbar"><div class="avatar-tabs"><button class="avatar-tab ${avatarPickerTab==='avatars'?"active":""}" data-a="avatarTab" data-tab="avatars">🐾 Personages <b>${AVATAR_COUNT}</b></button><button class="avatar-tab ${avatarPickerTab==='accessories'?"active":""}" data-a="avatarTab" data-tab="accessories">✨ Accessoires <b>${ACCESSORY_COUNT}</b></button></div><label class="avatar-search">⌕<input id="avatarSearch" placeholder="Zoek op naam..." value="${esc(avatarPickerSearch)}"></label></div>
        <div class="catalog-scroll"><div class="catalog-heading"><div><span class="eyebrow">${avatarPickerTab==='avatars'?"PERSONAGES":"ACCESSOIRES"}</span><h2>${avatarPickerTab==='avatars'?"Kies je personage":"Kies je accessoire"}</h2></div><span class="catalog-count">${avatarPickerTab==='avatars'?AVATAR_COUNT:ACCESSORY_COUNT} beschikbaar</span></div><div class="avatar-catalog-grid ${avatarPickerTab==='avatars'?"show-avatars":"show-accessories"}">${avatarPickerTab==='avatars'?avatarChoiceMarkup():accessoryChoiceMarkup()}</div></div>
      </section>
    </main>
    <footer class="avatar-picker-bottom"><div class="selection-status"><span>GESELECTEERD</span><strong>${esc(AVATAR_NAMES[avatarDraft.avatar]||"Avatar")} · ${esc(avatarDraft.accessory===null?"Geen accessoire":ACCESSORY_NAMES[avatarDraft.accessory]||"Accessoire")}</strong></div><div class="avatar-bottom-actions"><button class="btn w" data-a="closeAvatarPicker">Annuleren</button><button class="btn g avatar-ready" data-a="avatarDone">✓ Klaar</button></div></footer>
  </div>`;
  document.body.append(m);document.body.classList.add('avatar-picker-open');setTimeout(()=>m.querySelector('#avatarSearch')?.focus(),0);
}
function refreshAvatarPickerCatalog(){
  const m=document.querySelector('.avatar-picker-screen');if(!m)return;
  const grid=m.querySelector('.avatar-catalog-grid');if(grid)grid.innerHTML=avatarPickerTab==='avatars'?avatarChoiceMarkup():accessoryChoiceMarkup();
  const head=m.querySelector('.catalog-heading h2');if(head)head.textContent=avatarPickerTab==='avatars'?'Kies je personage':'Kies je accessoire';
  const count=m.querySelector('.catalog-count');if(count)count.textContent=`${avatarPickerTab==='avatars'?AVATAR_COUNT:ACCESSORY_COUNT} beschikbaar`;
  m.querySelectorAll('.avatar-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===avatarPickerTab));
  const search=m.querySelector('#avatarSearch');if(search)search.value=avatarPickerSearch;
}
function rerenderAvatarPicker(){
  const m=document.querySelector('.avatar-picker-screen');if(!m)return;
  const live=m.querySelector('#avatarLive');if(live)live.innerHTML=avatarMarkup(avatarDraft,275);
  const label=m.querySelector('#avatarLiveName');if(label)label.textContent=AVATAR_NAMES[avatarDraft.avatar]||'Avatar';
  const sub=m.querySelector('#avatarLiveAccessory');if(sub)sub.textContent=avatarDraft.accessory===null?'Geen accessoire':(ACCESSORY_NAMES[avatarDraft.accessory]||'Accessoire');
  const status=m.querySelector('.selection-status strong');if(status)status.textContent=`${AVATAR_NAMES[avatarDraft.avatar]||'Avatar'} · ${avatarDraft.accessory===null?'Geen accessoire':(ACCESSORY_NAMES[avatarDraft.accessory]||'Accessoire')}`;
  refreshAvatarPickerCatalog();
}
act.pickAvatar=d=>{const idx=Number(d.index);if(d.kind==='avatar')avatarDraft.avatar=clampIndex(idx,AVATAR_COUNT);else avatarDraft.accessory=normalizeAccessory(idx);rerenderAvatarPicker()};
act.avatarTab=d=>{avatarPickerTab=d.tab==='accessories'?'accessories':'avatars';avatarPickerSearch='';refreshAvatarPickerCatalog()};
act.avatarDone=()=>{const p=normalizeProfile(avatarDraft);saveProfile(p);const cb=avatarPickerCallback;avatarPickerCallback=null;document.querySelector('.avatar-modal')?.remove();document.body.classList.remove('avatar-picker-open');cb?.(p)};
act.closeAvatarPicker=()=>{avatarPickerCallback=null;document.querySelector('.avatar-modal')?.remove();document.body.classList.remove('avatar-picker-open')};
act.customizeAvatar=()=>{if(!G||!CODE)return;const cur=G.players?.[user.uid]||savedProfile();openAvatarPicker(cur,p=>{update(ref(db,`games/${CODE}/players/${user.uid}`),p).then(()=>toast('Avatar bijgewerkt!'),e=>toast(em(e)) )},'Avatar aanpassen')};
document.addEventListener('input',e=>{if(e.target?.id!=='avatarSearch')return;avatarPickerSearch=e.target.value||'';refreshAvatarPickerCatalog()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.avatar-modal'))act.closeAvatarPicker()});

/* ---------- Accounts (opgeslagen in de Realtime Database, zonder Firebase Authentication) ---------- */
const enc=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function hashPw(pw,salt){const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
 return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:100000},k,256))}
const mailKey=e=>e.toLowerCase().replace(/\./g,",");
const userKey=n=>encodeURIComponent(n.toLowerCase()).replace(/\./g,"%2E");
function login(key,name,email){user={uid:key,displayName:name,email};localStorage.setItem("quizzo_user",JSON.stringify(user));home()}
try{user=JSON.parse(localStorage.getItem("quizzo_user"))}catch(e){user=null}
setTimeout(home,0);
function authView(){
 const reg=mode=="reg";
 A.innerHTML=`<div class="center"><h1 class="logo">Quizzo!</h1><form id="af" class="card"><h2>${reg?"Account maken":"Inloggen"}</h2>
 ${reg?'<input name="u" placeholder="Gebruikersnaam" required minlength="2" maxlength="30">':""}
 <input name="e" type="${reg?"email":"text"}" placeholder="${reg?"E-mailadres":"Gebruikersnaam of e-mailadres"}" required>
 <input name="p" type="password" placeholder="Wachtwoord (minimaal 6 tekens)" required minlength="6">
 <button class="btn b">${reg?"Registreren":"Inloggen"}</button>
 <a class="link" data-a="mode">${reg?"Heb je al een account? Inloggen":"Nog geen account? Registreren"}</a></form></div>`;
 $("#af").onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target),id=f.get("e").trim(),pw=f.get("p"),btn=ev.target.querySelector("button");btn.disabled=true;
  try{
   if(reg){const name=f.get("u").trim(),key=userKey(name);
    if(name.length<2)throw "Gebruikersnaam: minimaal 2 tekens.";
    if((await get(ref(db,"users/"+key))).exists())throw "Deze gebruikersnaam is al bezet.";
    if((await get(ref(db,"emails/"+mailKey(id)))).exists())throw "Dit e-mailadres is al in gebruik.";
    const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    await set(ref(db,"users/"+key),{username:name,email:id,salt,hash:await hashPw(pw,salt),created:Date.now()});
    await set(ref(db,"emails/"+mailKey(id)),key);
    login(key,name,id)}
   else{let key=userKey(id),u=(await get(ref(db,"users/"+key))).val();
    if(!u&&id.includes("@")){key=(await get(ref(db,"emails/"+mailKey(id)))).val()||"";u=key?(await get(ref(db,"users/"+key))).val():null}
    if(!u||u.hash!==await hashPw(pw,u.salt))throw "Gebruikersnaam of wachtwoord klopt niet.";
    login(key,u.username,u.email)}
  }catch(err){toast(typeof err=="string"?err:em(err));btn.disabled=false}}}
act.mode=()=>{mode=mode=="reg"?"login":"reg";authView()};
act.out=()=>{localStorage.removeItem("quizzo_user");sessionStorage.removeItem("quizzo_adm");ADM=null;user=null;home()};

/* ---------- Home ---------- */
function home(){
 cleanup();Q=null;joinCode=null;if(!user)return authView();
 A.innerHTML=`<header><b class="logo s">Quizzo!</b><span class="hr"><button class="btn w sm ib" data-a="log" title="Updatelog" aria-label="Updatelog">📢</button><button class="btn w sm" data-a="admin" title="Sitebeheer">⚙ Sitebeheer</button><button class="btn w sm" data-a="menu">${esc(user.displayName||user.email)} ▾</button></span></header>
 <nav class="tabs">${[["join","Quiz joinen"],["discover","Ontdek quizzen"],["make","Quiz maken"],["mine","Gemaakte quizzen"]].map(([k,l])=>`<button data-a="tab" data-k="${k}" class="${tab==k?"on":""}">${l}</button>`).join("")}</nav><main id="tc" class="wrap"></main>`;
 tabView()}
act.tab=d=>{tab=d.k;joinCode=null;home()};
async function tabView(){
 const c=$("#tc");
 if(tab=="join"){
  c.innerHTML=joinCode?`<div class="card narrow"><h2>Kies je naam</h2><input id="nm" maxlength="20" placeholder="Jouw naam" value="${esc(user.displayName||"")}"><button class="btn g" data-a="enter">Meedoen</button></div>`
  :`<div class="card narrow"><h2>Quiz joinen</h2><input id="code" inputmode="numeric" maxlength="6" placeholder="Spelcode"><button class="btn b" data-a="check">Verder</button></div>`;
  return;
 }
 if(tab=="discover"){
  c.innerHTML=`<div class="discover-head"><div><span class="eyebrow">OPENBAAR</span><h2>Ontdek quizzen</h2><p>Bekijk, lees en speel alle openbare quizzen. Klik op een quiz om de vragen en antwoorden te bekijken. Je kunt openbare quizzen alleen spelen, nooit bewerken.</p></div><div class="discover-badge">🌍 Iedereen kan spelen</div></div><div id="publicQuizList" class="discover-grid"><div class="card narrow loading-card">Quizzen laden...</div></div>`;
  const qsSnap=await get(ref(db,"quizzes")).catch(e=>(toast(em(e)),null));
  const all=qsSnap?.val()||{};
  const items=[];
  const ownerIds=new Set();
  Object.entries(all).forEach(([ownerId,ownerQuizzes])=>{
    if(!ownerQuizzes || typeof ownerQuizzes!=="object")return;
    Object.entries(ownerQuizzes).forEach(([id,qz])=>{
      // Oude quizzen hebben soms nog geen public-veld: die behandelen we als openbaar.
      if(!qz||typeof qz!=="object"||qz.public===false)return;
      const count=arr(qz.questions).length;
      if(!String(qz.title||"").trim()||!count)return;
      ownerIds.add(ownerId);
      const mine=ownerId===user.uid;
      items.push({id,ownerId,mine,qz:{...qz,public:true},ownerName:qz.creatorName||"Quizzo speler"});
    });
  });
  const ownerNames={};
  await Promise.all([...ownerIds].map(async ownerId=>{
    try{
      const snap=await get(ref(db,"users/"+ownerId));
      ownerNames[ownerId]=snap.val()?.username||"Quizzo speler";
    }catch(e){
      ownerNames[ownerId]="Quizzo speler";
    }
  }));
  items.forEach(item=>{if(!item.qz.creatorName)item.ownerName=ownerNames[item.ownerId]||item.ownerName});
  items.sort((a,b)=>(Number(b.qz.updated)||0)-(Number(a.qz.updated)||0));
  const list=$("#publicQuizList");
  if(!list)return;
  list.innerHTML=items.length?items.map((item,i)=>`<article class="public-qcard" role="button" tabindex="0" data-a="publicView" data-owner="${esc(item.ownerId)}" data-id="${esc(item.id)}" style="--delay:${Math.min(i,12)*35}ms">
    <div class="public-thumb" style="background-image:url('${esc(themeAsset(safeTheme(item.qz.theme),"jpg"))}')"><span>${THEMES[safeTheme(item.qz.theme)].icon} ${esc(THEMES[safeTheme(item.qz.theme)].name)}</span><div class="public-thumb-overlay">👀 Bekijk quiz</div></div>
    <div class="public-qbody"><div class="public-meta"><span>👤 ${esc(item.ownerName)}${item.mine?" · Jouw quiz":""}</span><span>📝 ${countLabel(item.qz.questions)}</span></div><h3>${esc(item.qz.title)}</h3><p class="public-description">${esc(item.qz.description||"Geen beschrijving toegevoegd.")}</p><small class="public-open-note">${item.mine?"Openbare quiz · bekijken en spelen · niet bewerkbaar":"Openbare quiz · klik om vragen en antwoorden te bekijken"}</small><button class="btn b" data-a="publicPlay" data-owner="${esc(item.ownerId)}" data-id="${esc(item.id)}">▶ Spelen</button></div>
  </article>`).join(""):`<div class="card narrow empty-discover"><h2>Nog geen openbare quizzen</h2><p>Wanneer publieke quizzen zijn opgeslagen, verschijnen ze hier automatisch.</p><button class="btn w sm" data-a="tab" data-k="mine">Naar mijn quizzen</button></div>`;
  wireThemePreviews();
  return;
 }
 if(tab=="make"){
  c.innerHTML=`<div class="card narrow"><h2>Quiz maken</h2><input id="qn" maxlength="60" placeholder="Naam van de quiz"><button class="btn b" data-a="create">Maken</button></div>`;
  return;
 }
 c.innerHTML="Laden...";
 const s=await get(ref(db,"quizzes/"+user.uid)).catch(e=>(toast(em(e)),null)),v=s?.val()||{},ids=Object.keys(v);
 c.innerHTML=ids.length?ids.map(id=>`<div class="qcard"><div><b>${esc(v[id].title)}</b><small>${arr(v[id].questions).length} ${arr(v[id].questions).length===1?"onderdeel":"onderdelen"} · ${v[id].public===false?"privé":"openbaar"}</small></div><div>
   <button class="btn b sm" data-a="play" data-id="${id}">Spelen</button> <button class="btn g sm" data-a="host" data-id="${id}">Hosten</button> <button class="btn w sm" data-a="edit" data-id="${id}">Bewerken</button> <button class="btn r sm" data-a="delq" data-id="${id}">Verwijderen</button></div></div>`).join("")
  :`<div class="card narrow">Je hebt nog geen quizzen. Ga naar "Quiz maken" om te beginnen.</div>`;
}
const countLabel=questions=>{const n=arr(questions).length;return `${n} ${n===1?"onderdeel":"onderdelen"}`};
act.check=async()=>{const c=$("#code").value.trim();if(!c)return;
 const s=await get(ref(db,"games/"+c)).catch(e=>(toast(em(e)),null));if(!s)return;
 if(!s.exists()||s.val().state!="lobby")return toast("Deze code klopt niet of de quiz is al gestart.");
 joinCode=c;tabView()};
act.enter=async()=>{const n=$("#nm").value.trim();if(!n)return toast("Vul een naam in.");
 const s=await get(ref(db,"games/"+joinCode)).catch(()=>null);if(!s?.exists()||s.val().state!="lobby")return toast("Deze quiz is niet meer beschikbaar."),home();
 const profile=randProfile();saveProfile(profile);await set(ref(db,`games/${joinCode}/players/${user.uid}`),{name:n,score:0,...profile}).catch(e=>toast(em(e)));run(joinCode,false)};
act.create=()=>{const n=$("#qn").value.trim();if(!n)return toast("Geef je quiz eerst een naam.");
 Q={title:n,description:"",theme:"classic",public:true,questions:[]};QID=null;ADMIN_EDIT=null;SEL=-1;editorView()};
act.edit=async d=>{const v=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();
 Q={title:v.title||"",description:v.description||"",theme:safeTheme(v.theme),public:v.public!==false,creatorName:v.creatorName||user.displayName||"Quizzo speler",questions:arr(v.questions).map(q=>({...q,a:q.type==="dia"?[]:arr(q.a),info:q.info||"",time:Number.isInteger(q.time)?q.time:20,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints}))};QID=d.id;ADMIN_EDIT=null;SEL=0;editorView()};
act.delq=async d=>{if(confirm("Deze quiz verwijderen?")){await remove(ref(db,`quizzes/${user.uid}/${d.id}`));tabView()}};

async function openPlayChooser(qz,ownerId,id){
 if(!qz)return toast("Deze quiz kon niet worden geladen.");
 document.querySelectorAll(".modal").forEach(x=>x.remove());
 const m=document.createElement("div");m.className="modal";
 m.innerHTML=`<div class="card mode-card"><div class="public-mode-badge">🌍 Openbare quiz</div><h2>${esc(qz.title)}</h2><p>Kies hoe je deze quiz wilt spelen. De quiz blijft alleen-lezen voor jou.</p><button class="btn b" data-a="publicSolo" data-owner="${esc(ownerId)}" data-id="${esc(id)}">👤 Alleen spelen</button><button class="btn g" data-a="publicHost" data-owner="${esc(ownerId)}" data-id="${esc(id)}">🎮 Multiplayer hosten</button><button class="btn w" data-a="closem">Annuleren</button></div>`;
 document.body.append(m);
}
function publicQuestionHtml(q,i){
 q=q&&typeof q==='object'?q:{};
 const n=i+1;
 const time=Number(q.time)||20;
 const doubleText=q.doublePoints?'2× ':'';
 if(q.type==='dia'){
  return '<article class="preview-q preview-dia"><div class="preview-q-top"><span class="preview-number">'+n+'</span><span class="preview-type dia">🖼️ DIA</span><span class="preview-time">'+time+'s</span></div><h3>'+esc(q.text||'Dia')+'</h3><p>'+esc(q.info||'')+'</p><div class="preview-no-points">Geen vraag • geen punten</div></article>';
 }
 if(q.type==='typing'){
  const good=arr(q.a).filter(x=>String(x??'').trim()).map((a,j)=>'<div class="preview-answer-row"><span>'+(j+1)+'</span>'+esc(a)+'</div>').join('');
  return '<article class="preview-q preview-typing"><div class="preview-q-top"><span class="preview-number">'+n+'</span><span class="preview-type typing">⌨️ TYPEN</span><span class="preview-time">'+time+'s</span></div><h3>'+esc(q.text||'Typvraag')+'</h3><div class="preview-answer-label">Goede antwoorden</div><div class="preview-answer-list">'+(good||'<div class="preview-empty">Geen antwoorden ingesteld</div>')+'</div><div class="preview-points">'+doubleText+'max. 1000 punten · aftrek op milliseconde</div></article>';
 }
 const answers=arr(q.a);
 const typeClass=q.type==='tf'?'tf':'quiz';
 const typeLabel=q.type==='tf'?'✓✕ WAAR / NIET WAAR':'▲ QUIZVRAAG';
 const answerHtml=answers.map((a,j)=>{
   const cls=['r','b','y','g'][j%4];
   const sym=['▲','◆','●','■'][j%4];
   const correct=j===Number(q.correct);
   return '<div class="preview-answer '+cls+(correct?' correct':'')+'"><span>'+sym+'</span><em>'+esc(a??'')+'</em>'+(correct?'<b>✓ Goed</b>':'')+'</div>';
 }).join('');
 return '<article class="preview-q"><div class="preview-q-top"><span class="preview-number">'+n+'</span><span class="preview-type '+typeClass+'">'+typeLabel+'</span><span class="preview-time">'+time+'s</span></div><h3>'+esc(q.text||'Vraag')+'</h3><div class="preview-answer-grid">'+answerHtml+'</div><div class="preview-points">'+doubleText+'max. 1000 punten · juiste antwoord gemarkeerd</div></article>';
}
async function openPublicQuiz(qz,ownerId,id){
 if(!qz)return toast("Deze quiz kon niet worden geladen.");
 const m=document.createElement("div");m.className="modal public-view-modal";
 const qs=arr(qz.questions);
 m.innerHTML=`<div class="card public-view-card"><div class="public-view-head"><div><span class="eyebrow">🌍 OPENBARE QUIZ</span><h2>${esc(qz.title||"Quiz")}</h2><p class="public-view-description">${esc(qz.description||"Geen beschrijving toegevoegd.")}</p><p>Gemaakt door <b>${esc(qz.creatorName||"Quizzo speler")}</b> · ${countLabel(qs)}</p></div><button class="btn w sm" data-a="closem">Sluiten</button></div><div class="public-view-theme"><span>${THEMES[safeTheme(qz.theme)].icon}</span><b>${esc(THEMES[safeTheme(qz.theme)].name)}</b><small>Vragen en antwoorden bekijken</small></div><div class="public-question-list">${qs.length?qs.map(publicQuestionHtml).join(""):`<div class="card narrow"><p>Deze quiz heeft nog geen onderdelen.</p></div>`}</div><div class="public-view-actions"><button class="btn b" data-a="publicPlay" data-owner="${esc(ownerId)}" data-id="${esc(id)}">▶ Spelen</button><button class="btn w" data-a="closem">Sluiten</button></div></div>`;
 document.body.append(m);
}
act.publicView=async d=>{try{const qz=(await get(ref(db,`quizzes/${d.owner}/${d.id}`))).val();if(!qz||qz.public===false)return toast("Deze quiz is niet openbaar.");await openPublicQuiz(qz,d.owner,d.id)}catch(e){toast(em(e))}};

act.publicPlay=async d=>{
 try{const qz=(await get(ref(db,`quizzes/${d.owner}/${d.id}`))).val();if(qz?.public===false)return toast("Deze quiz is niet openbaar.");await openPlayChooser(qz,d.owner,d.id)}catch(e){toast(em(e))}
};
act.publicSolo=async d=>{
 act.closem();
 try{const qz=(await get(ref(db,`quizzes/${d.owner}/${d.id}`))).val();if(!qz||qz.public===false)return toast("Deze quiz is niet openbaar.");openAvatarPicker(savedProfile(),async profile=>{const code=await createGame(qz,"solo",profile);run(code,true)},"Kies je avatar")}catch(e){toast(em(e))}
};
act.publicHost=async d=>{
 act.closem();
 try{const qz=(await get(ref(db,`quizzes/${d.owner}/${d.id}`))).val();if(!qz||qz.public===false)return toast("Deze quiz is niet openbaar.");const code=await createGame(qz,"multiplayer");run(code,true)}catch(e){toast(em(e))}
};
act.play=async d=>{
 const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();if(!qz)return toast("Deze quiz kon niet worden geladen.");
 await openPlayChooser(qz,user.uid,d.id);
};

/* ---------- Editor ---------- */
const newQ=(type="quiz")=>type==="tf"?{type:"tf",text:"",time:20,points:1000,doublePoints:false,a:["Waar","Niet waar"],correct:-1}:type==="dia"?{type:"dia",text:"",info:"",time:10,points:1000,doublePoints:false,a:[],correct:-1}:type==="typing"?{type:"typing",text:"",time:20,points:1000,doublePoints:false,a:[""],correct:-1}:{type:"quiz",text:"",time:20,points:1000,doublePoints:false,a:["","","",""],correct:-1};
const qOk=q=>q.type==="dia"?q.text.trim()&&q.info.trim()&&q.time>=5&&q.time<=120&&Number.isInteger(q.time):q.type==="typing"?q.text.trim()&&q.a.some(x=>x.trim())&&q.time>=5&&q.time<=120&&Number.isInteger(q.time):q.text.trim()&&q.a.every(x=>x.trim())&&q.correct>=0&&q.time>=5&&q.time<=120&&Number.isInteger(q.time);
const valid=()=>Q.title.trim()&&Q.questions.length&&Q.questions.every(qOk);
function editorView(){
 applyTheme(Q.theme);
 A.innerHTML=`<header class="ed"><div class="editor-title-wrap">${ADMIN_EDIT?`<span class="admin-edit-badge">⚙ Sitebeheer</span>`:""}<input class="qtitle" data-f="title" placeholder="Naam van de quiz" value="${esc(Q.title)}"><button class="btn w sm settings-btn" data-a="settings">⚙ Instellingen</button></div><span><button class="btn w sm" data-a="exit">Sluiten</button> <button id="sv" class="btn g sm" data-a="save" title="Vul alles in om op te slaan">Opslaan</button></span></header>
 <div class="theme-strip"><span class="theme-strip-icon">${THEMES[safeTheme(Q.theme)].icon}</span><b>${esc(THEMES[safeTheme(Q.theme)].name)}</b><small>Dit thema zie je tijdens het spelen op het scherm van de host en op telefoons.</small></div>
 <div class="edw"><aside id="side"></aside><section id="main"></section></div>`;side();mainQ();saveBtn();wireThemePreviews()}
function side(){
 $("#side").innerHTML=Q.questions.map((q,i)=>`<div class="thumb ${i==SEL?"on":""}" data-a="sel" data-i="${i}" draggable="true" data-drag-index="${i}" title="Sleep om de volgorde te veranderen"><div class="drag-handle" aria-hidden="true">⠿</div><small>${i+1} ${q.type=="tf"?"Waar/niet waar":q.type=="dia"?"Dia":q.type=="typing"?"Typen":"Quiz"} ${qOk(q)?"":'<span class="bad">! onvolledig</span>'}</small><div class="tt">${esc(q.text)||"Nieuwe vraag"}${q.doublePoints?'<span class="mini-double">2×</span>':""}</div><button class="x" data-a="dq" data-i="${i}" aria-label="Vraag verwijderen">×</button></div>`).join("")+`<button class="btn b" data-a="newq">+ Vraag toevoegen</button>`}
function mainQ(){
 const q=Q.questions[SEL];
 if(!q)return $("#main").innerHTML=`<div class="empty"><div class="big-msg">Nog geen vragen</div><p>Voeg je eerste vraag toe.</p><button class="btn b" data-a="newq">+ Vraag toevoegen</button></div>`;
 if(q.type==="dia"){$("#main").innerHTML=`<div class="slide-editor card"><div class="type-badge dia">🖼️ DIA</div><input class="qbig" data-f="text" placeholder="Titel van de dia" value="${esc(q.text)}"><textarea class="qinfo" data-f="info" rows="8" placeholder="Schrijf hier de informatie die je wilt laten zien...">${esc(q.info||"")}</textarea><div class="opts"><label>Duur van de dia (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label></div><div class="slide-preview"><div class="slide-kicker">DIA</div><h2>${esc(q.text)||"Jouw titel"}</h2><p>${esc(q.info)||"Jouw informatie verschijnt hier."}</p></div></div>`;return}
 if(q.type==="typing"){$("#main").innerHTML=`<div class="type-badge typing">⌨️ TYPEN</div><input class="qbig" data-f="text" placeholder="Typ hier je vraag" value="${esc(q.text)}">
 <div class="opts"><label>Tijd om te antwoorden (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label><div class="fixed-points"><span>Vaste punten</span><b>1000</b><small>Maximaal 1000 • daalt per milliseconde</small></div><button class="btn ${q.doublePoints?"g":"w"} double-toggle ${q.doublePoints?"active":""}" data-a="double" title="${q.doublePoints?"Dubbele punten staan aan":"Dubbele punten staan uit"}">${q.doublePoints?"✓ ":""}Dubbele punten</button></div>
 <div class="typing-answers card"><div class="typing-answer-head"><div><b>Goede antwoorden</b><small>Hoofdletters en leestekens worden genegeerd.</small></div><button class="btn b sm" data-a="addtypeanswer">+ Antwoord toevoegen</button></div><div class="typing-answer-list">${q.a.map((t,i)=>`<div class="typing-answer-row"><span class="typing-index">${i+1}</span><input data-f="a" data-i="${i}" maxlength="160" placeholder="Goed antwoord ${i+1}" value="${esc(t)}"><button class="btn w sm icon-btn" data-a="deltypeanswer" data-i="${i}" ${q.a.length<=1?"disabled":""} aria-label="Antwoord verwijderen">×</button></div>`).join("")}</div></div>
 <p class="typing-help">Elke ingevulde regel telt als een goed antwoord. Je kunt onbeperkt mogelijke antwoorden toevoegen. <b>Punten zijn altijd 1000.</b></p>`;return}
 $("#main").innerHTML=`<div class="type-badge ${q.type==="tf"?"tf":"quiz"}">${q.type==="tf"?"✓ ✗ WAAR OF NIET WAAR":"▲ QUIZVRAAG"}</div><input class="qbig" data-f="text" placeholder="Typ hier je vraag" value="${esc(q.text)}">
 <div class="opts"><label>Tijd om te antwoorden (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label><div class="fixed-points"><span>Vaste punten</span><b>1000</b><small>Maximaal 1000 • daalt per milliseconde</small></div><button class="btn ${q.doublePoints?"g":"w"} double-toggle ${q.doublePoints?"active":""}" data-a="double" title="${q.doublePoints?"Dubbele punten staan aan":"Dubbele punten staan uit"}">${q.doublePoints?"✓ ":""}Dubbele punten</button></div>
 <div class="agrid ${q.type==="tf"?"tf":""}">${q.type==="tf"?q.a.map((t,i)=>`<div class="ans ${["g","r"][i]}"><span>${["✓","✗"][i]}</span><em>${esc(t)}</em><label class="chk" title="Goed antwoord"><input type="radio" name="ok" data-f="correct" data-i="${i}" ${q.correct==i?"checked":""}><b></b></label></div>`).join(""):q.a.map((t,i)=>`<div class="ans ${COL[i]}"><span>${SYM[i]}</span><input data-f="a" data-i="${i}" placeholder="Antwoord ${"ABCD"[i]}" value="${esc(t)}"><label class="chk" title="Goed antwoord"><input type="radio" name="ok" data-f="correct" data-i="${i}" ${q.correct==i?"checked":""}><b></b></label></div>`).join("")}</div>
 <p style="color:var(--ink)">Selecteer het rondje bij het goede antwoord. <b>Punten zijn altijd 1000.</b></p>`}
const saveBtn=()=>{const b=$("#sv");if(b)b.disabled=!valid()};
document.addEventListener("input",e=>{const t=e.target,f=t.dataset.f;if(!f||!Q)return;const q=Q.questions[SEL];if(!q&&f!="title")return;
 if(f=="settingsTitle"){Q.title=t.value;const qt=document.querySelector(".qtitle");if(qt)qt.value=t.value;saveBtn();return;}
 if(f=="settingsDescription"){Q.description=t.value;return;}
 if(f=="title")Q.title=t.value;else if(f=="text")q.text=t.value;else if(f=="info")q.info=t.value;else if(f=="time")q.time=t.value===""?NaN:+t.value;
 else if(f=="a")q.a[+t.dataset.i]=t.value;else if(f=="correct")q.correct=+t.dataset.i;
 side();saveBtn()});
act.sel=d=>{SEL=+d.i;side();mainQ()};
act.dq=d=>{Q.questions.splice(+d.i,1);SEL=Math.min(SEL,Q.questions.length-1);side();mainQ();saveBtn()};
act.settings=()=>{
 const m=document.createElement("div");m.className="modal";
 const current=safeTheme(Q.theme);
 m.innerHTML=`<div class="card settings-card"><div class="picker-head"><div><span class="eyebrow">QUIZ INSTELLINGEN</span><h2>Instellingen</h2><p>Pas de naam en het uiterlijk van je quiz aan.</p></div><button class="btn w sm picker-close" data-a="closem">×</button></div>
 <label class="settings-field"><span>Naam van de quiz</span><input id="settingsTitle" data-f="settingsTitle" maxlength="60" value="${esc(Q.title)}" placeholder="Naam van de quiz"></label>
 <label class="settings-field"><span>Beschrijving van de quiz</span><textarea id="settingsDescription" data-f="settingsDescription" rows="5" maxlength="500" placeholder="Waar gaat deze quiz over?">${esc(Q.description||"")}</textarea><small class="settings-help">Deze beschrijving is zichtbaar in Ontdek quizzen wanneer je quiz openbaar is.</small></label>
 <div class="visibility-setting"><div><b>🌍 Zichtbaarheid</b><small>Kies of andere spelers deze quiz in <b>Ontdek quizzen</b> mogen zien. Standaard is een quiz openbaar.</small></div><div class="visibility-switch" role="group" aria-label="Zichtbaarheid van de quiz"><button class="visibility-option ${Q.public!==false?"active":""}" data-a="visibilityPick" data-value="public">🌍 Openbaar</button><button class="visibility-option ${Q.public===false?"active":""}" data-a="visibilityPick" data-value="private">🔒 Privé</button></div><div class="visibility-note ${Q.public===false?"private":"public"}" id="visibilityNote">${Q.public===false?"Alleen jij kunt deze quiz zien en bewerken.":"Iedereen kan deze quiz vinden, bekijken en spelen."}</div></div>
 <div class="settings-section"><div class="settings-label"><b>Achtergrondthema</b><small>Kies 1 van de 25 stijlen. Je ziet de echte achtergrond als preview; die wordt tijdens het spelen op host én speler gebruikt.</small></div><div class="theme-grid">${themeIds.map(id=>`<button class="theme-choice ${id===current?"selected":""}" data-a="themePick" data-theme="${id}"><img class="theme-choice-thumb" data-theme="${id}" src="${themeAsset(id,"jpg")}" alt="${esc(THEMES[id].name)} voorbeeld" decoding="async"><span class="theme-choice-meta"><b>${esc(THEMES[id].name)}</b><small>${id===current?"✓ Geselecteerd":"Thema kiezen"}</small></span></button>`).join("")}</div></div>
 <div class="settings-actions"><button class="btn w" data-a="closem">Annuleren</button><button class="btn g" data-a="saveSettings">Instellingen opslaan</button></div></div>`;
 document.body.append(m);
 wireThemePreviews();
};
act.themePick=d=>{Q.theme=safeTheme(d.theme);document.querySelectorAll(".theme-choice").forEach(x=>x.classList.toggle("selected",x.dataset.theme===Q.theme));applyTheme(Q.theme);const strip=document.querySelector(".theme-strip");if(strip){strip.querySelector(".theme-strip-icon").textContent=THEMES[Q.theme].icon;strip.querySelector("b").textContent=THEMES[Q.theme].name}};
act.visibilityPick=d=>{Q.public=d.value!=="private";document.querySelectorAll(".visibility-option").forEach(x=>x.classList.toggle("active",(x.dataset.value==="public")===Q.public));const n=$("#visibilityNote");if(n){n.className="visibility-note "+(Q.public?"public":"private");n.textContent=Q.public?"Iedereen kan deze quiz vinden, bekijken en spelen.":"Alleen jij kunt deze quiz zien en bewerken."}saveBtn();};
act.saveSettings=()=>{const input=$("#settingsTitle"),desc=$("#settingsDescription");const name=input?.value.trim();if(!name)return toast("Geef je quiz een naam.");Q.title=name;Q.description=(desc?.value||"").trim();applyTheme(Q.theme);document.querySelector(".qtitle")&&(document.querySelector(".qtitle").value=name);act.closem();saveBtn();side()};
let dragIndex=-1;
document.addEventListener("dragstart",e=>{const t=e.target.closest("[data-drag-index]");if(!t||!Q)return;dragIndex=+t.dataset.dragIndex;t.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(dragIndex))});
document.addEventListener("dragend",e=>{e.target.closest("[data-drag-index]")?.classList.remove("dragging");dragIndex=-1;document.querySelectorAll("[data-drag-index].drag-over").forEach(x=>x.classList.remove("drag-over"))});
document.addEventListener("dragover",e=>{const t=e.target.closest("[data-drag-index]");if(!t||!Q||dragIndex<0)return;e.preventDefault();document.querySelectorAll("[data-drag-index].drag-over").forEach(x=>x.classList.remove("drag-over"));t.classList.add("drag-over")});
document.addEventListener("dragleave",e=>{const t=e.target.closest("[data-drag-index]");if(t&&!t.contains(e.relatedTarget))t.classList.remove("drag-over")});
document.addEventListener("drop",e=>{const t=e.target.closest("[data-drag-index]");if(!t||!Q||dragIndex<0)return;e.preventDefault();const to=+t.dataset.dragIndex;if(dragIndex===to)return;const moved=Q.questions.splice(dragIndex,1)[0];Q.questions.splice(to,0,moved);SEL=Q.questions.indexOf(moved);side();mainQ();saveBtn();dragIndex=-1});
let pointerDrag={active:false,start:-1,target:-1,timer:null};
const clearPointerDrag=()=>{if(pointerDrag.timer)clearTimeout(pointerDrag.timer);document.querySelectorAll(".thumb.pointer-drag,.thumb.drag-over").forEach(x=>x.classList.remove("pointer-drag","drag-over"));pointerDrag={active:false,start:-1,target:-1,timer:null}};
document.addEventListener("pointerdown",e=>{const h=e.target.closest(".drag-handle"),t=h?.closest("[data-drag-index]");if(!h||!t||!Q)return;const start=+t.dataset.dragIndex;pointerDrag={active:false,start,target:-1,timer:setTimeout(()=>{pointerDrag.active=true;t.classList.add("pointer-drag");try{t.setPointerCapture(e.pointerId)}catch(_){}} ,180)} });
document.addEventListener("pointermove",e=>{if(pointerDrag.start<0)return;if(!pointerDrag.timer&&!pointerDrag.active)return;const t=document.elementFromPoint(e.clientX,e.clientY)?.closest?.("[data-drag-index]");if(!t||!Q)return;if(!pointerDrag.active)return;pointerDrag.target=+t.dataset.dragIndex;document.querySelectorAll(".thumb.drag-over").forEach(x=>x.classList.remove("drag-over"));if(pointerDrag.target!==pointerDrag.start)t.classList.add("drag-over")});
document.addEventListener("pointerup",e=>{if(pointerDrag.start<0){clearPointerDrag();return}if(pointerDrag.active&&pointerDrag.target>=0&&pointerDrag.target!==pointerDrag.start&&Q){const from=pointerDrag.start,to=pointerDrag.target,moved=Q.questions.splice(from,1)[0];Q.questions.splice(to,0,moved);SEL=Q.questions.indexOf(moved);side();mainQ();saveBtn()}clearPointerDrag()});
document.addEventListener("pointercancel",clearPointerDrag);
act.newq=()=>{const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="card type-picker"><div class="picker-head"><div><span class="eyebrow">NIEUWE INHOUD</span><h2>Kies een vraagtype</h2><p>Maak je quiz afwisselend met vragen en informatieve dia's.</p></div><button class="btn w sm picker-close" data-a="closem">×</button></div><div class="type-grid">
  <button class="type-option blue" data-a="addq"><span class="type-art"><span class="art-shape">▲</span><span class="art-shape small">◆</span><span class="art-shape tiny">●</span></span><span class="type-name">Quizvraag</span><span class="type-desc">4 antwoorden • 1000 punten • snel spelen</span><span class="type-chip">QUIZ</span></button>
  <button class="type-option green" data-a="addtf"><span class="type-art tf-art"><span>✓</span><span>✕</span></span><span class="type-name">Waar of niet waar</span><span class="type-desc">2 keuzes • 1000 punten • simpel en snel</span><span class="type-chip">WAAR / NIET WAAR</span></button>
  <button class="type-option purple" data-a="adddia"><span class="type-art dia-art">🖼️</span><span class="type-name">Dia</span><span class="type-desc">Titel + informatie • geen antwoord • geen punten</span><span class="type-chip">DIA</span></button>
  <button class="type-option orange" data-a="addtyping"><span class="type-art typing-art">⌨️</span><span class="type-name">Typen</span><span class="type-desc">Speler typt woord of zin • 1000 punten • zoveel goede antwoorden als je wilt</span><span class="type-chip">TYPEN</span></button>
 </div></div>`;document.body.append(m)};
act.closem=()=>document.querySelector(".modal")?.remove();
const addQ=t=>{act.closem();Q.questions.push(newQ(t));SEL=Q.questions.length-1;side();mainQ();saveBtn()};
act.addq=()=>addQ("quiz");
act.addtf=()=>addQ("tf");
act.adddia=()=>addQ("dia");
act.addtyping=()=>addQ("typing");
act.double=()=>{const q=Q.questions[SEL];if(!q||q.type==="dia")return;q.doublePoints=!q.doublePoints;mainQ();side()};
act.addtypeanswer=()=>{const q=Q.questions[SEL];if(!q||q.type!=="typing")return;q.a.push("");mainQ();setTimeout(()=>document.querySelector('.typing-answer-row:last-child input')?.focus(),0);saveBtn()};
act.deltypeanswer=d=>{const q=Q.questions[SEL];if(!q||q.type!=="typing"||q.a.length<=1)return;q.a.splice(+d.i,1);mainQ();saveBtn()};
act.exit=()=>{if(confirm("Sluiten zonder opslaan?")){const fromAdmin=!!ADMIN_EDIT;Q=null;QID=null;ADMIN_EDIT=null;if(fromAdmin){act.admin();}else{tab="mine";home()}}};
act.save=async()=>{if(!valid())return;const ownerId=ADMIN_EDIT?.ownerId||user.uid;const id=QID||push(ref(db,"quizzes/"+ownerId)).key;
 const originalCreator=Q.creatorName||user.displayName||"Quizzo speler";
 const payload={title:Q.title.trim(),description:String(Q.description||"").trim(),theme:safeTheme(Q.theme),public:Q.public!==false,creatorName:originalCreator,questions:Q.questions.map(q=>({...q,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints})),updated:Date.now()};
 try{await set(ref(db,`quizzes/${ownerId}/${id}`),payload)}catch(e){return toast(em(e))}
 const fromAdmin=!!ADMIN_EDIT;Q=null;ADMIN_EDIT=null;QID=null;if(fromAdmin){toast("Quiz van gebruiker bijgewerkt!");act.admin();return;}tab="mine";home();toast("Quiz opgeslagen!")};

/* ---------- Game ---------- */
const cols=q=>q.type=="tf"?["g","r"]:COL,syms=q=>q.type=="tf"?["✓","✗"]:SYM;
const INTRO_MS=5000,DOUBLE_BONUS_INTRO_MS=2500;
const randomCode=async()=>{let code;do{code=String(Math.floor(100000+Math.random()*900000))}while((await get(ref(db,"games/"+code))).exists());return code};
const createGame=async(qz,gameMode,playerProfile=null)=>{const code=await randomCode();const solo=gameMode=="solo";const questions=arr(qz.questions).map(q=>({...q,a:arr(q.a),time:Number.isInteger(q.time)?q.time:20,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints,info:q.info||""}));const first=questions[0];const firstIsSlide=first?.type==="dia";const data={host:user.uid,mode:gameMode,state:solo?(firstIsSlide?"slide":"countdown"):"lobby",q:0,countdownStartedAt:solo&&!firstIsSlide?serverTimestamp():null,startedAt:solo&&firstIsSlide?serverTimestamp():null,quiz:{title:qz.title,theme:safeTheme(qz.theme),questions}};if(solo){const profile=normalizeProfile(playerProfile||savedProfile());data.players={[user.uid]:{name:user.displayName||user.email,score:0,...profile}};}await set(ref(db,"games/"+code),data);return code};
act.host=async d=>{try{const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();const code=await createGame(qz,"multiplayer");run(code,true)}catch(e){toast(em(e))}};
act.playhost=async d=>{act.closem();act.host(d)};
act.solo=async d=>{act.closem();try{const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();openAvatarPicker(savedProfile(),async profile=>{const code=await createGame(qz,"solo",profile);run(code,true)},"Kies je avatar")}catch(e){toast(em(e))}};
function run(code,host){cleanup();CODE=code;HOST=host;
 unsub=onValue(ref(db,"games/"+code),s=>{G=s.val();if(!G){if(!host&&CODE)toast("De quiz is afgesloten.");return home()}paint()});
 timer=setInterval(tick,250)}
const QS=()=>arr(G.quiz.questions).map(q=>({...q,a:arr(q.a)})),P=()=>Object.entries(G.players||{}).map(([id,p])=>({id,...p,...normalizeProfile(p)}));
const ANS=()=>G.answers?.[G.q]||{},MAX_POINTS=1000,pointsFor=q=>q.type==="dia"?0:MAX_POINTS*(q.doublePoints?2:1),earnedPointsFor=(q,answerAt)=>{if(q.type==="dia"||!Number.isFinite(answerAt))return 0;const started=Number(G.startedAt);const total=Math.max(1,Number(q.time)*1000);const remaining=Math.max(0,Math.min(total,started+total-Number(answerAt)));const base=Math.floor(MAX_POINTS*remaining/total);return base*(q.doublePoints?2:1)},introDuration=q=>INTRO_MS+(q.type!=="dia"&&q.doublePoints?DOUBLE_BONUS_INTRO_MS:0),end=()=>G.startedAt+QS()[G.q].time*1000,introEnd=()=>G.countdownStartedAt+introDuration(QS()[G.q]),isSlide=()=>QS()[G.q]?.type==="dia",isTyping=()=>QS()[G.q]?.type==="typing";
const normalizeAnswer=v=>String(v??"").normalize("NFKC").toLocaleLowerCase("nl-NL").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
const typingCorrect=(q,a)=>{const value=normalizeAnswer(a?.v??a?.value??"");return !!value&&q.a.some(x=>normalizeAnswer(x)===value)};
const setTimerBar=(el,ratio)=>{
 if(!el)return;
 const r=Math.max(0,Math.min(1,ratio));
 el.style.width=(r*100)+"%";
 el.classList.remove("timer-warn","timer-danger");
 if(r<=0.22)el.classList.add("timer-danger");
 else if(r<=0.5)el.classList.add("timer-warn");
};
function tick(){
 if(!G)return;
 if(G.state==="countdown"){
  const qIntro=QS()[G.q];
  if(qIntro?.type==="dia"){
   if(HOST&&!busy){busy=true;update(ref(db,"games/"+CODE),{state:"slide",countdownStartedAt:null,startedAt:serverTimestamp()}).catch(e=>toast(em(e))).finally(()=>busy=false)}
   return;
  }
  const dur=introDuration(qIntro),ms=introEnd()-now(),el=$("#introTm");if(el)el.textContent=Math.max(0,Math.ceil(ms/1000));
  const b=$("#introBar");setTimerBar(b,ms/dur);
  if(HOST&&ms<=0&&!busy){busy=true;update(ref(db,"games/"+CODE),{state:"question",startedAt:serverTimestamp()}).catch(e=>toast(em(e))).finally(()=>busy=false)}
  return;
 }
 if(G.state==="slide"){
  const q=QS()[G.q],ms=end()-now(),el=$("#slideTm");
  if(el)el.textContent=Math.max(0,Math.ceil(ms/1000));
  const b=$("#slideBar");setTimerBar(b,ms/(q.time*1000));
  if(HOST&&ms<=0&&!busy){busy=true;update(ref(db,"games/"+CODE),{state:"board"}).catch(e=>toast(em(e))).finally(()=>busy=false)}
  return;
 }
 if(G.state!="question")return;
 const q=QS()[G.q],ms=end()-now(),el=$("#tm");
 if(el)el.textContent=Math.max(0,Math.ceil(ms/1000));
 const b=$("#tb");setTimerBar(b,ms/(q.time*1000));
 if(HOST&&(ms<=0||(P().length&&Object.keys(ANS()).length>=P().length)))reveal()}
async function reveal(){if(busy)return;busy=true;const q=QS()[G.q];
 const ans=(await get(ref(db,`games/${CODE}/answers/${G.q}`))).val()||{},u={state:"reveal"};
 P().forEach(p=>{const a=ans[p.id];const ok=q.type==="typing"?!!a&&a.t<=end()+1500&&typingCorrect(q,a):!!a&&a.c===q.correct&&a.t<=end()+1500;const earned=ok?earnedPointsFor(q,Number(a?.t)):0;u[`players/${p.id}/ok`]=ok;u[`players/${p.id}/earnedPoints`]=earned;u[`players/${p.id}/score`]=(p.score||0)+earned});
 await update(ref(db,"games/"+CODE),u)}
act.start=()=>{const q=QS()[0];return q?.type==="dia"?update(ref(db,"games/"+CODE),{state:"slide",q:0,countdownStartedAt:null,startedAt:serverTimestamp()}):update(ref(db,"games/"+CODE),{state:"countdown",q:0,countdownStartedAt:serverTimestamp(),startedAt:null})};
act.next=()=>{
 if(G.state==="slide")return update(ref(db,"games/"+CODE),{state:"board"});
 if(G.state==="reveal")return G.q+1<QS().length?update(ref(db,"games/"+CODE),{state:"board"}):update(ref(db,"games/"+CODE),{state:"end"});
 if(G.state=="board"){
  const ni=G.q+1;
  if(ni>=QS().length)return update(ref(db,"games/"+CODE),{state:"end"});
  const nq=QS()[ni];
  return nq.type==="dia"
   ?update(ref(db,"games/"+CODE),{state:"slide",q:ni,countdownStartedAt:null,startedAt:serverTimestamp()})
   :update(ref(db,"games/"+CODE),{state:"countdown",q:ni,countdownStartedAt:serverTimestamp(),startedAt:null});
 }
};
act.close=()=>remove(ref(db,"games/"+CODE));
act.ans=d=>{if(G.state!="question"||now()>end()||ANS()[user.uid])return;const q=QS()[G.q];if(q.type==="typing")return act.typingSubmit();set(ref(db,`games/${CODE}/answers/${G.q}/${user.uid}`),{c:+d.i,t:now()})};
act.typingSubmit=()=>{if(G.state!=="question"||now()>end()||ANS()[user.uid]||!isTyping())return;const input=$("#typingInput");const value=input?.value?.trim()||"";if(!value)return toast("Typ eerst een antwoord in.");set(ref(db,`games/${CODE}/answers/${G.q}/${user.uid}`),{v:value,t:now()})};
document.addEventListener("submit",e=>{if(e.target?.id==="typingForm"){e.preventDefault();act.typingSubmit()}});
const sorted=()=>P().sort((a,b)=>(b.score||0)-(a.score||0));
function rankMap(scores){return Object.fromEntries(P().sort((a,b)=>(scores[b.id]??(b.score||0))-(scores[a.id]??(a.score||0))).map((p,i)=>[p.id,i+1]))}
function currentScoreMap(){return Object.fromEntries(P().map(p=>[p.id,p.score||0]))}
function animateLeaderboard(){
 document.querySelectorAll(".lb-score").forEach(el=>{
  const from=Number(el.dataset.from||0),to=Number(el.dataset.to||0),dur=850,start=performance.now();
  if(from===to){el.textContent=String(to);return}
  const step=t=>{const k=Math.min(1,(t-start)/dur),e=1-Math.pow(1-k,3),v=Math.round(from+(to-from)*e);el.textContent=String(v);if(k<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
 });
 document.querySelectorAll(".rank-up").forEach((el,i)=>{el.classList.remove("rank-up");void el.offsetWidth;el.classList.add("rank-up")});
}
function boardRows(list){
 const from=boardAnim?.from||{};
 return list.map((p,i)=>{const rank=i+1,prevRank=boardAnim?.ranks?.[p.id]||rank,delta=prevRank-rank,cls=delta>0?" rank-moved-up":"";
  const mood=delta>0?"rankup":delta<0?"overtaken":"";return `<div class="row lb-row${cls}"><span class="lb-name"><b class="lb-rank">${rank}</b>${avatarMarkup(p,40,mood)}<b>${esc(p.name)}</b>${delta>0?`<span class="rank-up">↑ ${delta}</span>`:delta<0?`<span class="rank-down">↓ ${Math.abs(delta)}</span>`:""}</span><span class="lb-score" data-from="${from[p.id]??p.score??0}" data-to="${p.score||0}">${from[p.id]??p.score??0}</span></div>`}).join("")}

function paint(){
 applyTheme(G?.quiz?.theme||"classic");
 if(G.state!="reveal"&&G.state!="countdown"&&G.state!="slide")busy=false;
 const avatarKey=P().map(p=>`${p.id}:${p.avatar}:${p.accessory}`).join("|");const key=[G.state,G.q,P().length,avatarKey,HOST?Object.keys(ANS()).length:ANS()[user.uid]?1:0].join();if(key==lastKey)return;
 const prevState=lastPaintState,prevScores={...scoreSnapshot},prevRanks={...rankSnapshot};
 lastKey=key;lastPaintState=G.state;
 const currentScores=currentScoreMap();
 if(G.state==="reveal"&&prevState==="question")boardAnim={from:prevScores,ranks:prevRanks};
 const q=G.state=="lobby"?null:QS()[G.q],me=G.players?.[user.uid],rank=sorted().findIndex(p=>p.id==user.uid)+1,SOLO=G.mode=="solo";
 const tiles=(cls,rev)=>{if(q.type==="typing"){const answered=Object.values(ANS()).filter(a=>a?.v!=null).length;return `<div class="typing-host-panel"><div class="typing-host-icon">⌨️</div><div><h2>${rev?"Goede antwoorden":"Typen"}</h2><p>${rev?q.a.filter(x=>x.trim()).map(x=>`<span class="accepted-chip">${esc(x)}</span>`).join(""):`Spelers typen zelf een woord of zin.`}</p><small>${answered} antwoord${answered===1?"":"en"}</small></div></div>`;}return q.a.map((t,i)=>{const n=Object.values(ANS()).filter(a=>a.c==i).length;return `<div class="ans ${cols(q)[i]} ${rev&&i!=q.correct?"dim":""}"><span>${rev&&i==q.correct?"✓":syms(q)[i]}</span><em>${esc(t)}</em>${rev?`<span class="n">${n}</span>`:""}</div>`}).join("")};
 const countdown=(showTitle)=>q.type==="dia"?`<div class="stage countdown-screen dia-countdown"><div class="dia-intro-card"><span class="eyebrow">DIA START</span><div class="dia-intro-title">${esc(q.text)}</div><div class="dia-intro-info">${esc(q.info||"")}</div></div><div class="countdown-layout"><div class="countdown-copy">Dia start in...</div><div class="countdown-number" id="introTm">5</div></div><div class="tbar intro-bar"><div id="introBar"></div></div></div>`:`<div class="stage countdown-screen${q.doublePoints?" has-double":""}">${q.doublePoints?'<div class="double-bonus-pop">2× PUNTEN</div>':""}<div class="countdown-title ${q.doublePoints?"after-bonus":""}">${showTitle?esc(q.text):"Kijk naar de host zijn scherm"}</div><div class="countdown-layout"><div class="countdown-copy">Vraag start in...</div><div class="countdown-number" id="introTm">${q.doublePoints?"8":"5"}</div></div><div class="tbar intro-bar"><div id="introBar"></div></div></div>`;
 const slideView=()=>`<div class="stage slide-view"><div class="slide-card"><div class="slide-kicker">DIA</div><h1>${esc(q.text)}</h1><div class="slide-info">${esc(q.info||"")}</div></div><div class="slide-timer"><div class="tcirc" id="slideTm">${q.time}</div><div class="countdown-copy">Op scherm</div></div><div class="tbar"><div id="slideBar"></div></div></div>`;
 const phoneSuccess=(buttonLabel="")=>`<div class="full ${me?.ok?"ok":"no"} phone-result"><div class="stage"><div class="phone-result-avatar">${avatarMarkup(me,100,me?.ok?"happy":"sad")}</div><div class="result-icon">${me?.ok?"✓":"✕"}</div><div class="big-msg">${me?.ok?"Goed gedaan!":"Helaas!"}</div><div class="result-points">${me?.ok?`+${me?.earnedPoints??0} punten`:"Geen punten"}</div><p>Totaal: ${me?.score||0} punten</p>${buttonLabel?`<button class="btn b result-next" data-a="next">${buttonLabel}</button>`:""}</div></div>`;
 let h="";
 if(HOST&&!SOLO){
  if(G.state=="lobby")h=`<div class="stage"><h2>${esc(G.quiz.title)}</h2><div>Ga naar <b>Quiz joinen</b> en vul de code in</div><div class="code">${CODE}</div><div><b>${P().length}</b> spelers</div><div class="chips">${P().map(p=>`<span class="player-chip">${avatarMarkup(p,34)}<b>${esc(p.name)}</b></span>`).join("")||"Wachten op spelers..."}</div><button class="btn g" data-a="start" ${P().length?"":"disabled"}>Quiz starten</button> <button class="btn w" data-a="close">Annuleren</button></div>`;
  else if(G.state=="countdown")h=countdown(true);
  else if(G.state=="slide")h=slideView();
  else if(G.state=="question")h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="hbar"><div class="tcirc" id="tm"></div><div class="cnt">${Object.keys(ANS()).length}<small>antwoorden</small></div></div><div class="tbar"><div id="tb"></div></div><div class="agrid big ${q.type=='tf'?"tf":""}">${tiles()}</div></div>`;
  else if(G.state=="reveal"){const ps=P();h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="agrid big ${q.type=='tf'?"tf":""}">${tiles("",true)}</div><div class="two"><div><h3>Goed ✓</h3>${ps.filter(p=>p.ok).map(p=>`${avatarMarkup(p,30,"happy")} ${esc(p.name)}`).join(" · ")||"Niemand"}</div><div><h3>Fout ✗</h3>${ps.filter(p=>!p.ok).map(p=>`${avatarMarkup(p,30,"sad")} ${esc(p.name)}`).join(" · ")||"Niemand"}</div></div><button class="btn b" data-a="next">Volgende</button></div>`}
  else if(G.state=="board")h=`<div class="stage leaderboard"><h1>Tussenstand</h1>${boardRows(sorted().slice(0,5))}<button class="btn b" data-a="next">Volgende vraag</button></div>`;
  else{const t=sorted().slice(0,3);h=`<div class="stage"><h1>Podium 🏆</h1><div class="pod">${[1,0,2].map(i=>t[i]?`<div class="pl"><div class="pn">${avatarMarkup(t[i],72,"celebrate")}<b>${esc(t[i].name)}</b><small>${t[i].score||0}</small></div><div class="blk p${i+1}">${i+1}</div></div>`:"").join("")}</div><button class="btn r" data-a="close">Quiz afsluiten</button></div>`}
 }else{
  if(G.state=="lobby")h=`<div class="center"><div class="game-avatar-large">${avatarMarkup(me,104)}</div><div class="big-msg">Je zit erin, ${esc(me?.name)}!</div><p>Wachten tot de host het spel start</p><button class="btn w" data-a="customizeAvatar">🎨 Avatar aanpassen</button></div>`;
  else if(G.state=="countdown")h=countdown(true);
  else if(G.state=="slide")h=slideView();
  else if(G.state=="question")h=ANS()[user.uid]?`<div class="center"><div class="big-msg">Antwoord verstuurd</div>Wachten op de uitslag...</div>`:q.type==="typing"?`<div class="stage answer-screen typing-player"><div class="typing-question"><div class="typing-kicker">⌨️ TYPEN</div><h1>${esc(q.text)}</h1><p>Typ het antwoord zo goed mogelijk.</p></div><div class="hbar"><div class="tcirc" id="tm"></div><div class="answer-label">${SOLO?"Typ je antwoord":"Typ je antwoord"}</div></div><div class="tbar"><div id="tb"></div></div><form id="typingForm" class="typing-form"><input id="typingInput" autocomplete="off" maxlength="160" placeholder="Typ hier je antwoord..." autofocus><button class="btn g typing-submit" type="submit">Antwoord versturen</button></form><p class="typing-note">Hoofdletters en leestekens maken niet uit.</p></div>`:`<div class="stage answer-screen"><div class="hbar"><div class="tcirc" id="tm"></div><div class="answer-label">${SOLO?"Kies je antwoord":"Kijk naar de host zijn scherm"}</div></div><div class="tbar"><div id="tb"></div></div><div class="agrid big ${q.type=='tf'?"tf":""}">${q.a.map((t,i)=>`<button class="ans ${cols(q)[i]}" data-a="ans" data-i="${i}"><span>${syms(q)[i]}</span><em>${esc(t)}</em></button>`).join("")}</div></div>`;
  else if(G.state=="reveal")h=phoneSuccess(SOLO?(G.q+1<QS().length?"Naar tussenstand":"Resultaat bekijken"):"");
  else if(G.state=="board")h=SOLO?`<div class="center leaderboard solo-board"><h1>Tussenstand</h1>${boardRows(sorted())}<button class="btn b" data-a="next">Volgende vraag</button></div>`:`<div class="center"><div class="big-msg">Plek ${rank}</div><div>${me?.score||0} punten</div></div>`;
  else if(SOLO)h=`<div class="center leaderboard solo-board"><div class="big-msg">Quiz voltooid 🎉</div>${boardRows(sorted())}<button class="btn r" data-a="close">Terug naar mijn quizzen</button></div>`;
  else h=`<div class="center"><div class="big-msg">${rank<=3?["🥇","🥈","🥉"][rank-1]:""} Plek ${rank}</div><div>${me?.score||0} punten</div><p>Wachten tot de host afsluit...</p></div>`}
 A.innerHTML=h;
 if(G.state==="countdown"&&q.type!=="dia"&&q.doublePoints){setTimeout(()=>$(".countdown-title.after-bonus")?.classList.add("title-live"),DOUBLE_BONUS_INTRO_MS)}
 if(G.state==="board"||G.state==="end")setTimeout(animateLeaderboard,20);
 scoreSnapshot=currentScoreMap();rankSnapshot=rankMap(scoreSnapshot);
 if(G.state==="board")boardAnim=null;
 tick()}

/* ---------- Menu, updatelog en sitebeheer ---------- */
let ADM=sessionStorage.getItem("quizzo_adm"),EDITU=null,UPD={},LOGL=[];
const pad=n=>String(n).padStart(2,"0"),fd=d=>String(d).split("-").reverse().join("-");
const nowDT=()=>{const d=new Date();return{date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,time:`${pad(d.getHours())}:${pad(d.getMinutes())}`}};
async function loadUpdates(){const v=(await get(ref(db,"updates"))).val()||{};UPD=v;
 return Object.entries(v).map(([id,u])=>({id,...u})).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))}
/* Schrijven als beheerder: het bewijs (_proof) gaat mee in dezelfde schrijfactie en wordt daarna weer gewist. */
async function priv(paths){await remove(ref(db,"_proof")).catch(()=>{});
 try{await update(ref(db),{_proof:ADM,...paths})}finally{await remove(ref(db,"_proof")).catch(()=>{})}}
const adminFail=()=>{ADM=null;sessionStorage.removeItem("quizzo_adm");toast("Geen toegang. Log opnieuw in als beheerder.");adminBody()};

act.menu=()=>{const old=$("#menu");if(old)return old.remove();const m=document.createElement("div");m.id="menu";m.className="menu";
 m.innerHTML=`<button data-a="admin">⚙ Sitebeheer</button><button data-a="log">📢 Updatelog</button><hr><button data-a="out">Uitloggen</button>`;$(".hr").append(m)};

act.log=async()=>{act.closem();const m=document.createElement("div");m.className="modal";
 m.innerHTML=`<div class="card wide"><div class="mh"><h2>Updatelog</h2><button class="btn w sm" data-a="closem">Sluiten</button></div><div id="logc">Laden...</div></div>`;document.body.append(m);
 let l;try{l=await loadUpdates()}catch(e){$("#logc").textContent="Kon de updates niet laden.";return toast(em(e))}showLog(l)};
function showLog(l){if(l)LOGL=l;const c=$("#logc");if(!c)return;
 c.innerHTML=LOGL.length?LOGL.map(u=>`<div class="urow" data-a="uopen" data-id="${u.id}"><b>${esc(u.title)}</b><small>${fd(u.date)} · ${esc(u.time)}</small></div>`).join(""):"Nog geen updates."}
act.uopen=d=>{const u=UPD[d.id];if(!u)return;
 $("#logc").innerHTML=`<button class="btn w sm" data-a="ulist">← Terug</button><h2 style="margin-top:14px">${esc(u.title)}</h2><small>${fd(u.date)} · ${esc(u.time)}</small><p class="ubody">${esc(u.body)}</p>`};
act.ulist=()=>showLog();

act.admin=()=>{A.innerHTML=`<header><b class="logo s">Sitebeheer</b><button class="btn w sm" data-a="back">Terug</button></header><main id="ac" class="wrap">Laden...</main>`;adminBody()};
act.back=()=>{ADM=null;EDITU=null;ADMIN_EDIT=null;Q=null;QID=null;sessionStorage.removeItem("quizzo_adm");home()};
async function adminBody(){const c=$("#ac");if(!c)return;let has;
 try{has=await get(ref(db,"admin/salt"))}catch(e){return c.innerHTML=`<div class="card narrow">Geen toegang tot de database. Controleer of de nieuwe database-regels zijn gepubliceerd.</div>`}
 if(!has.exists()){EDITU=null;return c.innerHTML=`<div class="card narrow"><h2>Beheerder instellen</h2><p>Stel het e-mailadres en wachtwoord voor sitebeheer in. Dit kan maar één keer.</p><input id="ae" type="email" placeholder="E-mailadres"><input id="ap" type="password" placeholder="Wachtwoord (minimaal 6 tekens)"><input id="ap2" type="password" placeholder="Herhaal wachtwoord"><button class="btn g" data-a="asetup">Instellen</button></div>`}
 if(!ADM)return c.innerHTML=`<div class="card narrow"><h2>Inloggen voor sitebeheer</h2><input id="ae" type="email" placeholder="E-mailadres"><input id="ap" type="password" placeholder="Wachtwoord"><button class="btn b" data-a="alogin">Inloggen</button></div>`;
 const l=await loadUpdates().catch(()=>[]),e=EDITU&&UPD[EDITU],n=nowDT();
 let quizRows="";
 try{
  const all=((await get(ref(db,"quizzes"))).val()||{});
  const owners=Object.keys(all);
  const ownerNames={};
  await Promise.all(owners.map(async ownerId=>{try{const u=(await get(ref(db,"users/"+ownerId))).val();ownerNames[ownerId]=u?.username||"Onbekende gebruiker"}catch(_){ownerNames[ownerId]="Onbekende gebruiker"}}));
  const rows=[];
  Object.entries(all).forEach(([ownerId,qs])=>{if(!qs||typeof qs!=="object")return;Object.entries(qs).forEach(([id,qz])=>{if(!qz||typeof qz!=="object")return;rows.push({ownerId,id,qz,ownerName:qz.creatorName||ownerNames[ownerId]||"Onbekende gebruiker"})})});
  rows.sort((a,b)=>(Number(b.qz.updated)||0)-(Number(a.qz.updated)||0));
  quizRows=rows.map(x=>`<div class="admin-quiz-row"><div class="admin-quiz-info"><div class="admin-quiz-title"><b>${esc(x.qz.title||"Naamloze quiz")}</b><span class="admin-visibility ${x.qz.public===false?"private":"public"}">${x.qz.public===false?"🔒 Privé":"🌍 Openbaar"}</span></div><small>👤 ${esc(x.ownerName)} · ${countLabel(x.qz.questions)}${x.qz.description?" · "+esc(x.qz.description).slice(0,90):""}</small></div><div class="admin-quiz-actions"><button class="btn b sm" data-a="adminEditQuiz" data-owner="${esc(x.ownerId)}" data-id="${esc(x.id)}">Bewerken</button><button class="btn r sm" data-a="adminDeleteQuiz" data-owner="${esc(x.ownerId)}" data-id="${esc(x.id)}">Verwijderen</button></div></div>`).join("");
 }catch(err){quizRows=`<div class="card narrow">De quizdatabase kon niet geladen worden: ${esc(em(err))}</div>`}
 c.innerHTML=`<div class="admin-layout"><section class="card wide admin-panel"><div class="admin-section-head"><div><span class="eyebrow">SITEBEHEER</span><h2>${e?"Update aanpassen":"Nieuwe update"}</h2><p>Beheer updates en alle quizzen op deze site.</p></div></div><input id="ut" maxlength="80" placeholder="Titel" value="${esc(e?.title)}"><div class="opts"><label>Datum<input id="ud" type="date" value="${e?e.date:n.date}"></label><label>Tijd<input id="uh" type="time" value="${e?e.time:n.time}"></label></div><textarea id="ub" rows="6" placeholder="Beschrijving">${esc(e?.body)}</textarea><button class="btn g" data-a="usave">${e?"Wijzigingen opslaan":"Update plaatsen"}</button>${e?'<button class="btn w" data-a="ucancel">Annuleren</button>':""}</section>
 <section class="admin-section"><div class="admin-section-head"><div><span class="eyebrow">QUIZZEN</span><h2>Alle quizzen</h2><p>Je kunt hier iedere quiz bekijken, bewerken, openbaar/privé maken, de beschrijving aanpassen en vragen wijzigen.</p></div><div class="admin-count">${quizRows?"Alle opgeslagen quizzen":"0 quizzen"}</div></div><div class="admin-quiz-list">${quizRows||"<div class=\"card narrow\">Nog geen quizzen.</div>"}</div></section>
 <section class="admin-section"><div class="admin-section-head"><div><span class="eyebrow">UPDATES</span><h2>Alle updates</h2></div></div><div class="admin-update-list">${l.map(u=>`<div class="qcard"><div><b>${esc(u.title)}</b><small>${fd(u.date)} · ${esc(u.time)}</small></div><div><button class="btn b sm" data-a="uedit" data-id="${u.id}">Aanpassen</button> <button class="btn r sm" data-a="udel" data-id="${u.id}">Verwijderen</button></div></div>`).join("")||"Nog geen updates."}</div></section></div>`;
 }
act.adminEditQuiz=async d=>{try{const owner=d.owner,id=d.id,v=(await get(ref(db,`quizzes/${owner}/${id}`))).val();if(!v)return toast("Deze quiz bestaat niet meer.");Q={title:v.title||"",description:v.description||"",theme:safeTheme(v.theme),public:v.public!==false,creatorName:v.creatorName||"Quizzo speler",questions:arr(v.questions).map(q=>({...q,a:q.type==="dia"?[]:arr(q.a),info:q.info||"",time:Number.isInteger(q.time)?q.time:20,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints}))};QID=id;ADMIN_EDIT={ownerId:owner,id};SEL=Math.max(0,Q.questions.length?0:-1);editorView()}catch(e){toast(em(e))}};
act.adminDeleteQuiz=async d=>{if(!confirm("Deze quiz definitief verwijderen uit de site?"))return;try{await remove(ref(db,`quizzes/${d.owner}/${d.id}`));toast("Quiz verwijderd.");adminBody()}catch(e){toast(em(e))}};
act.asetup=async()=>{const e=$("#ae").value.trim().toLowerCase(),p=$("#ap").value;
 if(!/^\S+@\S+\.\S+$/.test(e))return toast("Vul een geldig e-mailadres in.");
 if(p.length<6)return toast("Wachtwoord: minimaal 6 tekens.");
 if(p!==$("#ap2").value)return toast("De wachtwoorden zijn niet gelijk.");
 const salt=hex(crypto.getRandomValues(new Uint8Array(16))),hash=await hashPw(p,salt);
 try{await set(ref(db,"admin"),{email:e,salt,hash})}catch(err){toast("Het beheerdersaccount bestaat al of de database-regels zijn niet bijgewerkt.");return adminBody()}
 ADM=hash;sessionStorage.setItem("quizzo_adm",hash);toast("Beheerder ingesteld!");adminBody()};
act.alogin=async()=>{const e=$("#ae").value.trim().toLowerCase(),p=$("#ap").value;
 try{const [se,ss]=await Promise.all([get(ref(db,"admin/email")),get(ref(db,"admin/salt"))]);
  if(se.val()!==e)throw 0;const h=await hashPw(p,ss.val());ADM=h;await priv({adminPing:Date.now()});
  sessionStorage.setItem("quizzo_adm",h);adminBody()}catch(err){ADM=null;toast("E-mailadres of wachtwoord klopt niet.")}};
act.usave=async()=>{const t=$("#ut").value.trim(),d=$("#ud").value,h=$("#uh").value,b=$("#ub").value.trim();
 if(!t||!d||!h||!b)return toast("Vul titel, datum, tijd en beschrijving in.");
 const id=EDITU||push(ref(db,"updates")).key;
 try{await priv({["updates/"+id]:{title:t,date:d,time:h,body:b}})}catch(e){return adminFail()}
 EDITU=null;toast("Update opgeslagen!");adminBody()};
act.uedit=d=>{EDITU=d.id;adminBody();scrollTo(0,0)};
act.ucancel=()=>{EDITU=null;adminBody()};
act.udel=async d=>{if(!confirm("Deze update verwijderen?"))return;
 try{await priv({["updates/"+d.id]:null})}catch(e){return adminFail()}
 if(EDITU==d.id)EDITU=null;adminBody()};


/* ---------- Global interaction + boot ---------- */
function dispatchAction(el,event){
  if(!el) return;
  const name=el.dataset?.a;
  if(!name) return;
  const fn=act[name];
  if(typeof fn!=="function"){
    console.warn("Quizzo: onbekende actie",name);
    return;
  }
  const data={};
  for(const [k,v] of Object.entries(el.dataset||{})) if(k!=="a") data[k]=v;
  try{
    const result=fn(data,event);
    if(result && typeof result.catch==="function") result.catch(err=>toast(em(err)));
  }catch(err){
    console.error("Quizzo action error",name,err);
    toast(em(err));
  }
}

document.addEventListener("click",e=>{
  const el=e.target.closest?.("[data-a]");
  if(!el || el.disabled) return;
  dispatchAction(el,e);
});

document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ") && e.target.matches?.('[role="button"][data-a]')){
    e.preventDefault();
    if(!e.target.disabled) dispatchAction(e.target,e);
  }
});

// Keep client/server clocks aligned for multiplayer timing.
let unsubOffset=null;
try{
  unsubOffset=onValue(ref(db,".info/serverTimeOffset"),snap=>{offset=Number(snap.val()||0);});
}catch(e){
  console.warn("Quizzo server-time offset unavailable",e);
}

// Start only after every action handler has been registered.
queueMicrotask(async()=>{
  try{
    await ensureAvatarCatalog();
    if(!window.QUIZZO_AVATAR_CATALOG?.avatars?.length){
      console.warn('Quizzo: avatarcatalogus ontbreekt; de rest van de app start wel.');
    }
    home();
  }catch(err){
    console.error(err);
    if(window.quizzoFail) window.quizzoFail(em(err));
    else if(A) A.innerHTML='<div class="err"><h2>Quizzo kan niet starten</h2><p>'+esc(em(err))+'</p></div>';
  }
});
