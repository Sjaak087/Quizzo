import {db, ref, get, set, update, remove, push, onValue, serverTimestamp} from "./firebase.js";

window.__quizzoStarted = true;

const $=s=>document.querySelector(s),A=$("#app"),COL=["r","b","y","g"],SYM=["▲","◆","●","■"];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=x=>Array.isArray(x)?x:Object.values(x||{});
let user=null,tab="join",mode="login",joinCode=null,offset=0,unsub=null,timer=null,G=null,CODE=null,HOST=false,busy=false,lastKey="",Q=null,QID=null,SEL=0;
let scoreSnapshot={},rankSnapshot={},boardAnim=null,lastPaintState="";
const now=()=>Date.now()+offset;
onValue(ref(db,".info/serverTimeOffset"),s=>offset=s.val()||0);
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3200)}
const errs={"auth/email-already-in-use":"Dit e-mailadres is al in gebruik.","auth/invalid-credential":"E-mail of wachtwoord klopt niet.","auth/weak-password":"Wachtwoord moet minstens 6 tekens zijn.","auth/invalid-email":"Dit e-mailadres is ongeldig.","PERMISSION_DENIED":"Geen toegang: controleer de database-regels."};
const em=e=>errs[e.code]||errs[(e.message||"").match(/PERMISSION_DENIED/)?.[0]]||e.code||e.message;
const act={};
document.addEventListener("click",e=>{if(!e.target.closest('[data-a="menu"]'))$("#menu")?.remove();const t=e.target.closest("[data-a]");if(t&&!t.disabled)act[t.dataset.a]?.(t.dataset,t)});
function cleanup(){unsub?.();unsub=null;clearInterval(timer);G=null;CODE=null;busy=false;lastKey="";scoreSnapshot={};rankSnapshot={};boardAnim=null;lastPaintState=""}

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
 A.innerHTML=`<header><b class="logo s">Quizzo!</b><span class="hr"><button class="btn w sm ib" data-a="log" title="Updatelog" aria-label="Updatelog">📢</button><button class="btn w sm" data-a="menu">${esc(user.displayName||user.email)} ▾</button></span></header>
 <nav class="tabs">${[["join","Quiz joinen"],["make","Quiz maken"],["mine","Gemaakte quizzen"]].map(([k,l])=>`<button data-a="tab" data-k="${k}" class="${tab==k?"on":""}">${l}</button>`).join("")}</nav><main id="tc" class="wrap"></main>`;
 tabView()}
act.tab=d=>{tab=d.k;joinCode=null;home()};
async function tabView(){
 const c=$("#tc");
 if(tab=="join"){
  c.innerHTML=joinCode?`<div class="card narrow"><h2>Kies je naam</h2><input id="nm" maxlength="20" placeholder="Jouw naam" value="${esc(user.displayName||"")}"><button class="btn g" data-a="enter">Meedoen</button></div>`
  :`<div class="card narrow"><h2>Quiz joinen</h2><input id="code" inputmode="numeric" maxlength="6" placeholder="Spelcode"><button class="btn b" data-a="check">Verder</button></div>`}
 else if(tab=="make"){
  c.innerHTML=`<div class="card narrow"><h2>Quiz maken</h2><input id="qn" maxlength="60" placeholder="Naam van de quiz"><button class="btn b" data-a="create">Maken</button></div>`}
 else{
  c.innerHTML="Laden...";
  const s=await get(ref(db,"quizzes/"+user.uid)).catch(e=>(toast(em(e)),null)),v=s?.val()||{},ids=Object.keys(v);
  c.innerHTML=ids.length?ids.map(id=>`<div class="qcard"><div><b>${esc(v[id].title)}</b><small>${arr(v[id].questions).length} vragen</small></div><div>
   <button class="btn b sm" data-a="play" data-id="${id}">Spelen</button> <button class="btn g sm" data-a="host" data-id="${id}">Hosten</button> <button class="btn w sm" data-a="edit" data-id="${id}">Bewerken</button> <button class="btn r sm" data-a="delq" data-id="${id}">Verwijderen</button></div></div>`).join("")
  :`<div class="card narrow">Je hebt nog geen quizzen. Ga naar "Quiz maken" om te beginnen.</div>`}}
act.check=async()=>{const c=$("#code").value.trim();if(!c)return;
 const s=await get(ref(db,"games/"+c)).catch(e=>(toast(em(e)),null));if(!s)return;
 if(!s.exists()||s.val().state!="lobby")return toast("Deze code klopt niet of de quiz is al gestart.");
 joinCode=c;tabView()};
act.enter=async()=>{const n=$("#nm").value.trim();if(!n)return toast("Vul een naam in.");
 const s=await get(ref(db,"games/"+joinCode)).catch(()=>null);if(!s?.exists()||s.val().state!="lobby")return toast("Deze quiz is niet meer beschikbaar."),home();
 await set(ref(db,`games/${joinCode}/players/${user.uid}`),{name:n,score:0}).catch(e=>toast(em(e)));run(joinCode,false)};
act.create=()=>{const n=$("#qn").value.trim();if(!n)return toast("Geef je quiz eerst een naam.");
 Q={title:n,questions:[]};QID=null;SEL=-1;editorView()};
act.edit=async d=>{const v=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();
 Q={title:v.title,questions:arr(v.questions).map(q=>({...q,a:arr(q.a),info:q.info||"",time:Number.isInteger(q.time)?q.time:20,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints}))};QID=d.id;SEL=0;editorView()};
act.delq=async d=>{if(confirm("Deze quiz verwijderen?")){await remove(ref(db,`quizzes/${user.uid}/${d.id}`));tabView()}};

act.play=async d=>{
 const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();if(!qz)return toast("Deze quiz kon niet worden geladen.");
 const m=document.createElement("div");m.className="modal";
 m.innerHTML=`<div class="card mode-card"><h2>${esc(qz.title)}</h2><p>Kies hoe je deze quiz wilt spelen.</p><button class="btn b" data-a="solo" data-id="${d.id}">👤 Alleen spelen</button><button class="btn g" data-a="playhost" data-id="${d.id}">🎮 Multiplayer hosten</button><button class="btn w" data-a="closem">Annuleren</button></div>`;
 document.body.append(m)
};

/* ---------- Editor ---------- */
const newQ=(type="quiz")=>type=="tf"?{type:"tf",text:"",time:20,points:1000,doublePoints:false,a:["Waar","Niet waar"],correct:-1}:type=="dia"?{type:"dia",text:"",info:"",time:10,points:1000,doublePoints:false,a:[],correct:-1}:{type:"quiz",text:"",time:20,points:1000,doublePoints:false,a:["","","",""],correct:-1};
const qOk=q=>q.type==="dia"?q.text.trim()&&q.info.trim()&&q.time>=5&&q.time<=120&&Number.isInteger(q.time):q.text.trim()&&q.a.every(x=>x.trim())&&q.correct>=0&&q.time>=5&&q.time<=120&&Number.isInteger(q.time);
const valid=()=>Q.title.trim()&&Q.questions.length&&Q.questions.every(qOk);
function editorView(){
 A.innerHTML=`<header class="ed"><input class="qtitle" data-f="title" placeholder="Naam van de quiz" value="${esc(Q.title)}"><span><button class="btn w sm" data-a="exit">Sluiten</button> <button id="sv" class="btn g sm" data-a="save" title="Vul alles in om op te slaan">Opslaan</button></span></header>
 <div class="edw"><aside id="side"></aside><section id="main"></section></div>`;side();mainQ();saveBtn()}
function side(){
 $("#side").innerHTML=Q.questions.map((q,i)=>`<div class="thumb ${i==SEL?"on":""}" data-a="sel" data-i="${i}" draggable="true" data-drag-index="${i}" title="Sleep om de volgorde te veranderen"><div class="drag-handle" aria-hidden="true">⠿</div><small>${i+1} ${q.type=="tf"?"Waar/niet waar":q.type=="dia"?"Dia":"Quiz"} ${qOk(q)?"":'<span class="bad">! onvolledig</span>'}</small><div class="tt">${esc(q.text)||"Nieuwe vraag"}${q.doublePoints?'<span class="mini-double">2×</span>':""}</div><button class="x" data-a="dq" data-i="${i}" aria-label="Vraag verwijderen">×</button></div>`).join("")+`<button class="btn b" data-a="newq">+ Vraag toevoegen</button>`}
function mainQ(){
 const q=Q.questions[SEL];
 if(!q)return $("#main").innerHTML=`<div class="empty"><div class="big-msg">Nog geen vragen</div><p>Voeg je eerste vraag toe.</p><button class="btn b" data-a="newq">+ Vraag toevoegen</button></div>`;
 if(q.type==="dia"){$("#main").innerHTML=`<div class="slide-editor card"><div class="type-badge dia">🖼️ DIA</div><input class="qbig" data-f="text" placeholder="Titel van de dia" value="${esc(q.text)}"><textarea class="qinfo" data-f="info" rows="8" placeholder="Schrijf hier de informatie die je wilt laten zien...">${esc(q.info||"")}</textarea><div class="opts"><label>Duur van de dia (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label></div><div class="slide-preview"><div class="slide-kicker">DIA</div><h2>${esc(q.text)||"Jouw titel"}</h2><p>${esc(q.info)||"Jouw informatie verschijnt hier."}</p></div></div>`;return}
 $("#main").innerHTML=`<div class="type-badge ${q.type==="tf"?"tf":"quiz"}">${q.type==="tf"?"✓ ✗ WAAR OF NIET WAAR":"▲ QUIZVRAAG"}</div><input class="qbig" data-f="text" placeholder="Typ hier je vraag" value="${esc(q.text)}">
 <div class="opts"><label>Tijd om te antwoorden (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label><div class="fixed-points"><span>Vaste punten</span><b>1000</b><small>Altijd 1000 punten</small></div><button class="btn ${q.doublePoints?"g":"w"} double-toggle ${q.doublePoints?"active":""}" data-a="double" title="${q.doublePoints?"Dubbele punten staan aan":"Dubbele punten staan uit"}">${q.doublePoints?"✓ ":""}Dubbele punten</button></div>
 <div class="agrid ${q.type==="tf"?"tf":""}">${q.type==="tf"?q.a.map((t,i)=>`<div class="ans ${["g","r"][i]}"><span>${["✓","✗"][i]}</span><em>${esc(t)}</em><label class="chk" title="Goed antwoord"><input type="radio" name="ok" data-f="correct" data-i="${i}" ${q.correct==i?"checked":""}><b></b></label></div>`).join(""):q.a.map((t,i)=>`<div class="ans ${COL[i]}"><span>${SYM[i]}</span><input data-f="a" data-i="${i}" placeholder="Antwoord ${"ABCD"[i]}" value="${esc(t)}"><label class="chk" title="Goed antwoord"><input type="radio" name="ok" data-f="correct" data-i="${i}" ${q.correct==i?"checked":""}><b></b></label></div>`).join("")}</div>
 <p style="color:var(--ink)">Selecteer het rondje bij het goede antwoord. <b>Punten zijn altijd 1000.</b></p>`}
const saveBtn=()=>{const b=$("#sv");if(b)b.disabled=!valid()};
document.addEventListener("input",e=>{const t=e.target,f=t.dataset.f;if(!f||!Q)return;const q=Q.questions[SEL];if(!q&&f!="title")return;
 if(f=="title")Q.title=t.value;else if(f=="text")q.text=t.value;else if(f=="info")q.info=t.value;else if(f=="time")q.time=t.value===""?NaN:+t.value;
 else if(f=="a")q.a[+t.dataset.i]=t.value;else if(f=="correct")q.correct=+t.dataset.i;
 side();saveBtn()});
act.sel=d=>{SEL=+d.i;side();mainQ()};
act.dq=d=>{Q.questions.splice(+d.i,1);SEL=Math.min(SEL,Q.questions.length-1);side();mainQ();saveBtn()};
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
 </div></div>`;document.body.append(m)};
act.closem=()=>document.querySelector(".modal")?.remove();
const addQ=t=>{act.closem();Q.questions.push(newQ(t));SEL=Q.questions.length-1;side();mainQ();saveBtn()};
act.addq=()=>addQ("quiz");
act.addtf=()=>addQ("tf");
act.adddia=()=>addQ("dia");
act.double=()=>{const q=Q.questions[SEL];if(!q||q.type==="dia")return;q.doublePoints=!q.doublePoints;mainQ();side()};
act.exit=()=>{if(confirm("Sluiten zonder opslaan?")){Q=null;tab="mine";home()}};
act.save=async()=>{if(!valid())return;const id=QID||push(ref(db,"quizzes/"+user.uid)).key;
 try{await set(ref(db,`quizzes/${user.uid}/${id}`),{title:Q.title.trim(),questions:Q.questions.map(q=>({...q,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints})),updated:Date.now()})}catch(e){return toast(em(e))}
 Q=null;tab="mine";home();toast("Quiz opgeslagen!")};

/* ---------- Game ---------- */
const cols=q=>q.type=="tf"?["g","r"]:COL,syms=q=>q.type=="tf"?["✓","✗"]:SYM;
const INTRO_MS=5000,DOUBLE_BONUS_INTRO_MS=2500;
const randomCode=async()=>{let code;do{code=String(Math.floor(100000+Math.random()*900000))}while((await get(ref(db,"games/"+code))).exists());return code};
const createGame=async(qz,gameMode)=>{const code=await randomCode();const solo=gameMode=="solo";const questions=arr(qz.questions).map(q=>({...q,a:arr(q.a),time:Number.isInteger(q.time)?q.time:20,points:1000,doublePoints:q.type==="dia"?false:!!q.doublePoints,info:q.info||""}));const first=questions[0];const firstIsSlide=first?.type==="dia";const data={host:user.uid,mode:gameMode,state:solo?(firstIsSlide?"slide":"countdown"):"lobby",q:0,countdownStartedAt:solo&&!firstIsSlide?serverTimestamp():null,startedAt:solo&&firstIsSlide?serverTimestamp():null,quiz:{title:qz.title,questions}};if(solo)data.players={[user.uid]:{name:user.displayName||user.email,score:0}};await set(ref(db,"games/"+code),data);return code};
act.host=async d=>{try{const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();const code=await createGame(qz,"multiplayer");run(code,true)}catch(e){toast(em(e))}};
act.playhost=async d=>{act.closem();act.host(d)};
act.solo=async d=>{act.closem();try{const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();const code=await createGame(qz,"solo");run(code,true)}catch(e){toast(em(e))}};
function run(code,host){cleanup();CODE=code;HOST=host;
 unsub=onValue(ref(db,"games/"+code),s=>{G=s.val();if(!G){if(!host&&CODE)toast("De quiz is afgesloten.");return home()}paint()});
 timer=setInterval(tick,250)}
const QS=()=>arr(G.quiz.questions).map(q=>({...q,a:arr(q.a)})),P=()=>Object.entries(G.players||{}).map(([id,p])=>({id,...p}));
const ANS=()=>G.answers?.[G.q]||{},pointsFor=q=>q.type==="dia"?0:1000*(q.doublePoints?2:1),introDuration=q=>INTRO_MS+(q.type!=="dia"&&q.doublePoints?DOUBLE_BONUS_INTRO_MS:0),end=()=>G.startedAt+QS()[G.q].time*1000,introEnd=()=>G.countdownStartedAt+introDuration(QS()[G.q]),isSlide=()=>QS()[G.q]?.type==="dia";
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
 P().forEach(p=>{const a=ans[p.id],ok=!!a&&a.c===q.correct&&a.t<=end()+1500;u[`players/${p.id}/ok`]=ok;if(ok)u[`players/${p.id}/score`]=(p.score||0)+pointsFor(q)});
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
act.ans=d=>{if(G.state!="question"||now()>end()||ANS()[user.uid])return;set(ref(db,`games/${CODE}/answers/${G.q}/${user.uid}`),{c:+d.i,t:now()})};
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
  return `<div class="row lb-row${cls}"><span><b class="lb-rank">${rank}</b> ${esc(p.name)}${delta>0?`<span class="rank-up">↑ ${delta}</span>`:""}</span><span class="lb-score" data-from="${from[p.id]??p.score??0}" data-to="${p.score||0}">${from[p.id]??p.score??0}</span></div>`}).join("")}

function paint(){
 if(G.state!="reveal"&&G.state!="countdown"&&G.state!="slide")busy=false;
 const key=[G.state,G.q,P().length,HOST?Object.keys(ANS()).length:ANS()[user.uid]?1:0].join();if(key==lastKey)return;
 const prevState=lastPaintState,prevScores={...scoreSnapshot},prevRanks={...rankSnapshot};
 lastKey=key;lastPaintState=G.state;
 const currentScores=currentScoreMap();
 if(G.state==="reveal"&&prevState==="question")boardAnim={from:prevScores,ranks:prevRanks};
 const q=G.state=="lobby"?null:QS()[G.q],me=G.players?.[user.uid],rank=sorted().findIndex(p=>p.id==user.uid)+1,SOLO=G.mode=="solo";
 const tiles=(cls,rev)=>q.a.map((t,i)=>{const n=Object.values(ANS()).filter(a=>a.c==i).length;return `<div class="ans ${cols(q)[i]} ${rev&&i!=q.correct?"dim":""}"><span>${rev&&i==q.correct?"✓":syms(q)[i]}</span><em>${esc(t)}</em>${rev?`<span class="n">${n}</span>`:""}</div>`}).join("");
 const countdown=(showTitle)=>q.type==="dia"?`<div class="stage countdown-screen dia-countdown"><div class="dia-intro-card"><span class="eyebrow">DIA START</span><div class="dia-intro-title">${esc(q.text)}</div><div class="dia-intro-info">${esc(q.info||"")}</div></div><div class="countdown-layout"><div class="countdown-copy">Dia start in...</div><div class="countdown-number" id="introTm">5</div></div><div class="tbar intro-bar"><div id="introBar"></div></div></div>`:`<div class="stage countdown-screen${q.doublePoints?" has-double":""}">${q.doublePoints?'<div class="double-bonus-pop">2× PUNTEN</div>':""}<div class="countdown-title ${q.doublePoints?"after-bonus":""}">${showTitle?esc(q.text):"Kijk naar de host zijn scherm"}</div><div class="countdown-layout"><div class="countdown-copy">Vraag start in...</div><div class="countdown-number" id="introTm">${q.doublePoints?"8":"5"}</div></div><div class="tbar intro-bar"><div id="introBar"></div></div></div>`;
 const slideView=()=>`<div class="stage slide-view"><div class="slide-card"><div class="slide-kicker">DIA</div><h1>${esc(q.text)}</h1><div class="slide-info">${esc(q.info||"")}</div></div><div class="slide-timer"><div class="tcirc" id="slideTm">${q.time}</div><div class="countdown-copy">Op scherm</div></div><div class="tbar"><div id="slideBar"></div></div></div>`;
 const phoneSuccess=(buttonLabel="")=>`<div class="full ${me?.ok?"ok":"no"} phone-result"><div class="stage"><div class="result-icon">${me?.ok?"✓":"✕"}</div><div class="big-msg">${me?.ok?"Goed gedaan!":"Helaas!"}</div><div class="result-points">${me?.ok?`+${pointsFor(q)} punten`:"Geen punten"}</div><p>Totaal: ${me?.score||0} punten</p>${buttonLabel?`<button class="btn b result-next" data-a="next">${buttonLabel}</button>`:""}</div></div>`;
 let h="";
 if(HOST&&!SOLO){
  if(G.state=="lobby")h=`<div class="stage"><h2>${esc(G.quiz.title)}</h2><div>Ga naar <b>Quiz joinen</b> en vul de code in</div><div class="code">${CODE}</div><div><b>${P().length}</b> spelers</div><div class="chips">${P().map(p=>`<span>${esc(p.name)}</span>`).join("")||"Wachten op spelers..."}</div><button class="btn g" data-a="start" ${P().length?"":"disabled"}>Quiz starten</button> <button class="btn w" data-a="close">Annuleren</button></div>`;
  else if(G.state=="countdown")h=countdown(true);
  else if(G.state=="slide")h=slideView();
  else if(G.state=="question")h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="hbar"><div class="tcirc" id="tm"></div><div class="cnt">${Object.keys(ANS()).length}<small>antwoorden</small></div></div><div class="tbar"><div id="tb"></div></div><div class="agrid big ${q.type=='tf'?"tf":""}">${tiles()}</div></div>`;
  else if(G.state=="reveal"){const ps=P();h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="agrid big ${q.type=='tf'?"tf":""}">${tiles("",true)}</div><div class="two"><div><h3>Goed ✓</h3>${ps.filter(p=>p.ok).map(p=>esc(p.name)).join(", ")||"Niemand"}</div><div><h3>Fout ✗</h3>${ps.filter(p=>!p.ok).map(p=>esc(p.name)).join(", ")||"Niemand"}</div></div><button class="btn b" data-a="next">Volgende</button></div>`}
  else if(G.state=="board")h=`<div class="stage leaderboard"><h1>Tussenstand</h1>${boardRows(sorted().slice(0,5))}<button class="btn b" data-a="next">Volgende vraag</button></div>`;
  else{const t=sorted().slice(0,3);h=`<div class="stage"><h1>Podium 🏆</h1><div class="pod">${[1,0,2].map(i=>t[i]?`<div class="pl"><div class="pn">${esc(t[i].name)}<small>${t[i].score||0}</small></div><div class="blk p${i+1}">${i+1}</div></div>`:"").join("")}</div><button class="btn r" data-a="close">Quiz afsluiten</button></div>`}
 }else{
  if(G.state=="lobby")h=`<div class="center"><div class="big-msg">Je zit erin, ${esc(me?.name)}!</div><p>Wachten tot de host het spel start</p></div>`;
  else if(G.state=="countdown")h=countdown(true);
  else if(G.state=="slide")h=slideView();
  else if(G.state=="question")h=ANS()[user.uid]?`<div class="center"><div class="big-msg">Antwoord verstuurd</div>Wachten op de uitslag...</div>`:`<div class="stage answer-screen"><div class="hbar"><div class="tcirc" id="tm"></div><div class="answer-label">${SOLO?"Kies je antwoord":"Kijk naar de host zijn scherm"}</div></div><div class="tbar"><div id="tb"></div></div><div class="agrid big ${q.type=='tf'?"tf":""}">${q.a.map((t,i)=>`<button class="ans ${cols(q)[i]}" data-a="ans" data-i="${i}"><span>${syms(q)[i]}</span><em>${esc(t)}</em></button>`).join("")}</div></div>`;
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
 m.innerHTML=`<button data-a="admin">⚙ Sitebeheer</button><hr><button data-a="out">Uitloggen</button>`;$(".hr").append(m)};

act.log=async()=>{act.closem();const m=document.createElement("div");m.className="modal";
 m.innerHTML=`<div class="card wide"><div class="mh"><h2>Updatelog</h2><button class="btn w sm" data-a="closem">Sluiten</button></div><div id="logc">Laden...</div></div>`;document.body.append(m);
 let l;try{l=await loadUpdates()}catch(e){$("#logc").textContent="Kon de updates niet laden.";return toast(em(e))}showLog(l)};
function showLog(l){if(l)LOGL=l;const c=$("#logc");if(!c)return;
 c.innerHTML=LOGL.length?LOGL.map(u=>`<div class="urow" data-a="uopen" data-id="${u.id}"><b>${esc(u.title)}</b><small>${fd(u.date)} · ${esc(u.time)}</small></div>`).join(""):"Nog geen updates."}
act.uopen=d=>{const u=UPD[d.id];if(!u)return;
 $("#logc").innerHTML=`<button class="btn w sm" data-a="ulist">← Terug</button><h2 style="margin-top:14px">${esc(u.title)}</h2><small>${fd(u.date)} · ${esc(u.time)}</small><p class="ubody">${esc(u.body)}</p>`};
act.ulist=()=>showLog();

act.admin=()=>{A.innerHTML=`<header><b class="logo s">Sitebeheer</b><button class="btn w sm" data-a="back">Terug</button></header><main id="ac" class="wrap">Laden...</main>`;adminBody()};
act.back=()=>{ADM=null;EDITU=null;sessionStorage.removeItem("quizzo_adm");home()};
async function adminBody(){const c=$("#ac");if(!c)return;let has;
 try{has=await get(ref(db,"admin/salt"))}catch(e){return c.innerHTML=`<div class="card narrow">Geen toegang tot de database. Controleer of de nieuwe database-regels zijn gepubliceerd.</div>`}
 if(!has.exists()){EDITU=null;return c.innerHTML=`<div class="card narrow"><h2>Beheerder instellen</h2><p>Stel het e-mailadres en wachtwoord voor sitebeheer in. Dit kan maar één keer.</p><input id="ae" type="email" placeholder="E-mailadres"><input id="ap" type="password" placeholder="Wachtwoord (minimaal 6 tekens)"><input id="ap2" type="password" placeholder="Herhaal wachtwoord"><button class="btn g" data-a="asetup">Instellen</button></div>`}
 if(!ADM)return c.innerHTML=`<div class="card narrow"><h2>Inloggen voor sitebeheer</h2><input id="ae" type="email" placeholder="E-mailadres"><input id="ap" type="password" placeholder="Wachtwoord"><button class="btn b" data-a="alogin">Inloggen</button></div>`;
 const l=await loadUpdates().catch(()=>[]),e=EDITU&&UPD[EDITU],n=nowDT();
 c.innerHTML=`<div class="card wide" style="margin:0 auto"><h2>${e?"Update aanpassen":"Nieuwe update"}</h2><input id="ut" maxlength="80" placeholder="Titel" value="${esc(e?.title)}"><div class="opts"><label>Datum<input id="ud" type="date" value="${e?e.date:n.date}"></label><label>Tijd<input id="uh" type="time" value="${e?e.time:n.time}"></label></div><textarea id="ub" rows="6" placeholder="Beschrijving">${esc(e?.body)}</textarea><button class="btn g" data-a="usave">${e?"Wijzigingen opslaan":"Update plaatsen"}</button>${e?'<button class="btn w" data-a="ucancel">Annuleren</button>':""}</div>
 <h2 style="margin-top:28px">Alle updates</h2>${l.map(u=>`<div class="qcard"><div><b>${esc(u.title)}</b><small>${fd(u.date)} · ${esc(u.time)}</small></div><div><button class="btn b sm" data-a="uedit" data-id="${u.id}">Aanpassen</button> <button class="btn r sm" data-a="udel" data-id="${u.id}">Verwijderen</button></div></div>`).join("")||"Nog geen updates."}`}
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
