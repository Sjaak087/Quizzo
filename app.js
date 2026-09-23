import {db, ref, get, set, update, remove, push, onValue} from "./firebase.js";

window.__quizzoStarted = true;

const $=s=>document.querySelector(s),A=$("#app"),COL=["r","b","y","g"],SYM=["▲","◆","●","■"];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=x=>Array.isArray(x)?x:Object.values(x||{});
let user=null,tab="join",mode="login",joinCode=null,offset=0,unsub=null,timer=null,G=null,CODE=null,HOST=false,busy=false,lastKey="",Q=null,QID=null,SEL=0;
const now=()=>Date.now()+offset;
onValue(ref(db,".info/serverTimeOffset"),s=>offset=s.val()||0);
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3200)}
const errs={"auth/email-already-in-use":"Dit e-mailadres is al in gebruik.","auth/invalid-credential":"E-mail of wachtwoord klopt niet.","auth/weak-password":"Wachtwoord moet minstens 6 tekens zijn.","auth/invalid-email":"Dit e-mailadres is ongeldig.","PERMISSION_DENIED":"Geen toegang: controleer de database-regels."};
const em=e=>errs[e.code]||errs[(e.message||"").match(/PERMISSION_DENIED/)?.[0]]||e.code||e.message;
const act={};
document.addEventListener("click",e=>{const t=e.target.closest("[data-a]");if(t&&!t.disabled)act[t.dataset.a]?.(t.dataset,t)});
function cleanup(){unsub?.();unsub=null;clearInterval(timer);G=null;CODE=null;busy=false;lastKey=""}

/* ---------- Accounts (opgeslagen in de Realtime Database, zonder Firebase Authentication) ---------- */
const enc=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function hashPw(pw,salt){const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
 return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:100000},k,256))}
const mailKey=e=>e.toLowerCase().replace(/\./g,",");
function login(key,name,email){user={uid:key,displayName:name,email};localStorage.setItem("quizzo_user",JSON.stringify(user));home()}
try{user=JSON.parse(localStorage.getItem("quizzo_user"))}catch(e){user=null}
setTimeout(home,0);
function authView(){
 const reg=mode=="reg";
 A.innerHTML=`<div class="center"><h1 class="logo">Quizzo!</h1><form id="af" class="card"><h2>${reg?"Account maken":"Inloggen"}</h2>
 ${reg?'<input name="u" placeholder="Gebruikersnaam" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_\\-]{3,20}" title="3-20 tekens: letters, cijfers, _ en -">':""}
 <input name="e" type="${reg?"email":"text"}" placeholder="${reg?"E-mailadres":"Gebruikersnaam of e-mailadres"}" required>
 <input name="p" type="password" placeholder="Wachtwoord (minimaal 6 tekens)" required minlength="6">
 <button class="btn b">${reg?"Registreren":"Inloggen"}</button>
 <a class="link" data-a="mode">${reg?"Heb je al een account? Inloggen":"Nog geen account? Registreren"}</a></form></div>`;
 $("#af").onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target),id=f.get("e").trim(),pw=f.get("p"),btn=ev.target.querySelector("button");btn.disabled=true;
  try{
   if(reg){const name=f.get("u").trim(),key=name.toLowerCase();
    if(!/^[A-Za-z0-9_-]{3,20}$/.test(name))throw "Gebruikersnaam: 3-20 tekens, alleen letters, cijfers, _ en -.";
    if((await get(ref(db,"users/"+key))).exists())throw "Deze gebruikersnaam is al bezet.";
    if((await get(ref(db,"emails/"+mailKey(id)))).exists())throw "Dit e-mailadres is al in gebruik.";
    const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    await set(ref(db,"users/"+key),{username:name,email:id,salt,hash:await hashPw(pw,salt),created:Date.now()});
    await set(ref(db,"emails/"+mailKey(id)),key);
    login(key,name,id)}
   else{let key=id.toLowerCase();
    if(id.includes("@"))key=(await get(ref(db,"emails/"+mailKey(id)))).val()||"";
    if(!/^[a-z0-9_-]{3,20}$/.test(key))key="";
    const u=key&&(await get(ref(db,"users/"+key))).val();
    if(!u||u.hash!==await hashPw(pw,u.salt))throw "Gebruikersnaam of wachtwoord klopt niet.";
    login(key,u.username,u.email)}
  }catch(err){toast(typeof err=="string"?err:em(err));btn.disabled=false}}}
act.mode=()=>{mode=mode=="reg"?"login":"reg";authView()};
act.out=()=>{localStorage.removeItem("quizzo_user");user=null;home()};

/* ---------- Home ---------- */
function home(){
 cleanup();Q=null;joinCode=null;if(!user)return authView();
 A.innerHTML=`<header><b class="logo s">Quizzo!</b><span>${esc(user.displayName||user.email)} <button class="btn w sm" data-a="out">Uitloggen</button></span></header>
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
   <button class="btn g sm" data-a="host" data-id="${id}">Hosten</button> <button class="btn b sm" data-a="edit" data-id="${id}">Bewerken</button> <button class="btn r sm" data-a="delq" data-id="${id}">Verwijderen</button></div></div>`).join("")
  :`<div class="card narrow">Je hebt nog geen quizzen. Ga naar "Quiz maken" om te beginnen.</div>`}}
act.check=async()=>{const c=$("#code").value.trim();if(!c)return;
 const s=await get(ref(db,"games/"+c)).catch(e=>(toast(em(e)),null));if(!s)return;
 if(!s.exists()||s.val().state!="lobby")return toast("Deze code klopt niet of de quiz is al gestart.");
 joinCode=c;tabView()};
act.enter=async()=>{const n=$("#nm").value.trim();if(!n)return toast("Vul een naam in.");
 const s=await get(ref(db,"games/"+joinCode)).catch(()=>null);if(!s?.exists()||s.val().state!="lobby")return toast("Deze quiz is niet meer beschikbaar."),home();
 await set(ref(db,`games/${joinCode}/players/${user.uid}`),{name:n,score:0}).catch(e=>toast(em(e)));run(joinCode,false)};
act.create=()=>{const n=$("#qn").value.trim();if(!n)return toast("Geef je quiz eerst een naam.");
 Q={title:n,questions:[newQ()]};QID=null;SEL=0;editorView()};
act.edit=async d=>{const v=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();
 Q={title:v.title,questions:arr(v.questions).map(q=>({...q,a:arr(q.a)}))};QID=d.id;SEL=0;editorView()};
act.delq=async d=>{if(confirm("Deze quiz verwijderen?")){await remove(ref(db,`quizzes/${user.uid}/${d.id}`));tabView()}};

/* ---------- Editor ---------- */
const newQ=()=>({text:"",time:20,points:1000,a:["","","",""],correct:-1});
const qOk=q=>q.text.trim()&&q.a.every(x=>x.trim())&&q.correct>=0&&q.time>=5&&q.time<=120&&q.points>=0&&Number.isInteger(q.time)&&Number.isInteger(q.points);
const valid=()=>Q.title.trim()&&Q.questions.length&&Q.questions.every(qOk);
function editorView(){
 A.innerHTML=`<header class="ed"><input class="qtitle" data-f="title" placeholder="Naam van de quiz" value="${esc(Q.title)}"><span><button class="btn w sm" data-a="exit">Sluiten</button> <button id="sv" class="btn g sm" data-a="save" title="Vul alles in om op te slaan">Opslaan</button></span></header>
 <div class="edw"><aside id="side"></aside><section id="main"></section></div>`;side();mainQ();saveBtn()}
function side(){
 $("#side").innerHTML=Q.questions.map((q,i)=>`<div class="thumb ${i==SEL?"on":""}" data-a="sel" data-i="${i}"><small>${i+1} Quiz ${qOk(q)?"":'<span class="bad">! onvolledig</span>'}</small><div class="tt">${esc(q.text)||"Nieuwe vraag"}</div>${Q.questions.length>1?`<button class="x" data-a="dq" data-i="${i}" aria-label="Vraag verwijderen">×</button>`:""}</div>`).join("")+`<button class="btn b" data-a="newq">+ Vraag toevoegen</button>`}
function mainQ(){
 const q=Q.questions[SEL];
 $("#main").innerHTML=`<input class="qbig" data-f="text" placeholder="Typ hier je vraag" value="${esc(q.text)}">
 <div class="opts"><label>Tijd om te antwoorden (5-120 sec)<input type="number" min="5" max="120" data-f="time" value="${q.time}"></label><label>Punten voor goed antwoord<input type="number" min="0" data-f="points" value="${q.points}"></label></div>
 <div class="agrid">${q.a.map((t,i)=>`<div class="ans ${COL[i]}"><span>${SYM[i]}</span><input data-f="a" data-i="${i}" placeholder="Antwoord ${"ABCD"[i]}" value="${esc(t)}"><label class="chk" title="Goed antwoord"><input type="radio" name="ok" data-f="correct" data-i="${i}" ${q.correct==i?"checked":""}><b></b></label></div>`).join("")}</div>
 <p style="color:var(--ink)">Selecteer het rondje bij het goede antwoord.</p>`}
const saveBtn=()=>{const b=$("#sv");if(b)b.disabled=!valid()};
document.addEventListener("input",e=>{const t=e.target,f=t.dataset.f;if(!f||!Q)return;const q=Q.questions[SEL];
 if(f=="title")Q.title=t.value;else if(f=="text")q.text=t.value;else if(f=="time"||f=="points")q[f]=t.value===""?NaN:+t.value;
 else if(f=="a")q.a[+t.dataset.i]=t.value;else if(f=="correct")q.correct=+t.dataset.i;
 side();saveBtn()});
act.sel=d=>{SEL=+d.i;side();mainQ()};
act.dq=d=>{Q.questions.splice(+d.i,1);SEL=Math.min(SEL,Q.questions.length-1);side();mainQ();saveBtn()};
act.newq=()=>{const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="card"><h2>Kies een vraagtype</h2><button class="btn b" data-a="addq">▲ Quizvraag</button><button class="btn w" data-a="closem">Annuleren</button></div>`;document.body.append(m)};
act.closem=()=>document.querySelector(".modal")?.remove();
act.addq=()=>{act.closem();Q.questions.push(newQ());SEL=Q.questions.length-1;side();mainQ();saveBtn()};
act.exit=()=>{if(confirm("Sluiten zonder opslaan?")){Q=null;tab="mine";home()}};
act.save=async()=>{if(!valid())return;const id=QID||push(ref(db,"quizzes/"+user.uid)).key;
 try{await set(ref(db,`quizzes/${user.uid}/${id}`),{title:Q.title.trim(),questions:Q.questions,updated:Date.now()})}catch(e){return toast(em(e))}
 Q=null;tab="mine";home();toast("Quiz opgeslagen!")};

/* ---------- Game ---------- */
act.host=async d=>{const qz=(await get(ref(db,`quizzes/${user.uid}/${d.id}`))).val();let code;
 do{code=String(Math.floor(100000+Math.random()*900000))}while((await get(ref(db,"games/"+code))).exists());
 await set(ref(db,"games/"+code),{host:user.uid,state:"lobby",q:0,quiz:{title:qz.title,questions:qz.questions}}).catch(e=>toast(em(e)));run(code,true)};
function run(code,host){cleanup();CODE=code;HOST=host;
 unsub=onValue(ref(db,"games/"+code),s=>{G=s.val();if(!G){if(!host&&CODE)toast("De quiz is afgesloten.");return home()}paint()});
 timer=setInterval(tick,250)}
const QS=()=>arr(G.quiz.questions).map(q=>({...q,a:arr(q.a)})),P=()=>Object.entries(G.players||{}).map(([id,p])=>({id,...p}));
const ANS=()=>G.answers?.[G.q]||{},end=()=>G.startedAt+QS()[G.q].time*1000;
function tick(){if(!G||G.state!="question")return;const q=QS()[G.q],ms=end()-now(),el=$("#tm");
 if(el)el.textContent=Math.max(0,Math.ceil(ms/1000));const b=$("#tb");if(b)b.style.width=Math.max(0,ms/(q.time*10))+"%";
 if(HOST&&(ms<=0||(P().length&&Object.keys(ANS()).length>=P().length)))reveal()}
async function reveal(){if(busy)return;busy=true;const q=QS()[G.q];
 const ans=(await get(ref(db,`games/${CODE}/answers/${G.q}`))).val()||{},u={state:"reveal"};
 P().forEach(p=>{const a=ans[p.id],ok=!!a&&a.c===q.correct&&a.t<=end()+1500;u[`players/${p.id}/ok`]=ok;if(ok)u[`players/${p.id}/score`]=(p.score||0)+q.points});
 await update(ref(db,"games/"+CODE),u)}
act.start=()=>update(ref(db,"games/"+CODE),{state:"question",q:0,startedAt:now()});
act.next=()=>{if(G.state=="reveal")return update(ref(db,"games/"+CODE),{state:"board"});
 if(G.q+1<QS().length)update(ref(db,"games/"+CODE),{state:"question",q:G.q+1,startedAt:now()});else update(ref(db,"games/"+CODE),{state:"end"})};
act.close=()=>remove(ref(db,"games/"+CODE));
act.ans=d=>{if(now()>end()||ANS()[user.uid])return;set(ref(db,`games/${CODE}/answers/${G.q}/${user.uid}`),{c:+d.i,t:now()})};
const sorted=()=>P().sort((a,b)=>(b.score||0)-(a.score||0));
function paint(){
 if(G.state!="question")busy=false;
 const key=[G.state,G.q,P().length,HOST?Object.keys(ANS()).length:ANS()[user.uid]?1:0].join();if(key==lastKey)return;lastKey=key;
 const q=G.state=="lobby"?null:QS()[G.q],me=G.players?.[user.uid],rank=sorted().findIndex(p=>p.id==user.uid)+1;
 const tiles=(cls,rev)=>q.a.map((t,i)=>{const n=Object.values(ANS()).filter(a=>a.c==i).length;return `<div class="ans ${COL[i]} ${rev&&i!=q.correct?"dim":""}"><span>${rev&&i==q.correct?"✓":SYM[i]}</span><em>${esc(t)}</em>${rev?`<span class="n">${n}</span>`:""}</div>`}).join("");
 let h="";
 if(HOST){
  if(G.state=="lobby")h=`<div class="stage"><h2>${esc(G.quiz.title)}</h2><div>Ga naar <b>Quiz joinen</b> en vul de code in</div><div class="code">${CODE}</div><div><b>${P().length}</b> spelers</div><div class="chips">${P().map(p=>`<span>${esc(p.name)}</span>`).join("")||"Wachten op spelers..."}</div><button class="btn g" data-a="start" ${P().length?"":"disabled"}>Quiz starten</button> <button class="btn w" data-a="close">Annuleren</button></div>`;
  else if(G.state=="question")h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="hbar"><div class="tcirc" id="tm"></div><div class="cnt">${Object.keys(ANS()).length}<small>antwoorden</small></div></div><div class="tbar"><div id="tb"></div></div><div class="agrid big">${tiles()}</div></div>`;
  else if(G.state=="reveal"){const ps=P();h=`<div class="stage"><div class="qhead">${esc(q.text)}</div><div class="agrid big">${tiles("",true)}</div><div class="two"><div><h3>Goed ✓</h3>${ps.filter(p=>p.ok).map(p=>esc(p.name)).join(", ")||"Niemand"}</div><div><h3>Fout ✗</h3>${ps.filter(p=>!p.ok).map(p=>esc(p.name)).join(", ")||"Niemand"}</div></div><button class="btn b" data-a="next">Volgende</button></div>`}
  else if(G.state=="board")h=`<div class="stage"><h1>Tussenstand</h1>${sorted().slice(0,5).map((p,i)=>`<div class="row"><span>${i+1}. ${esc(p.name)}</span><span>${p.score||0}</span></div>`).join("")}<button class="btn b" data-a="next">${G.q+1<QS().length?"Volgende vraag":"Naar het podium"}</button></div>`;
  else{const t=sorted().slice(0,3);h=`<div class="stage"><h1>Podium 🏆</h1><div class="pod">${[1,0,2].map(i=>t[i]?`<div class="pl"><div class="pn">${esc(t[i].name)}<small>${t[i].score||0}</small></div><div class="blk p${i+1}">${i+1}</div></div>`:"").join("")}</div><button class="btn r" data-a="close">Quiz afsluiten</button></div>`}
 }else{
  if(G.state=="lobby")h=`<div class="center"><div class="big-msg">Je zit erin, ${esc(me?.name)}!</div>Wachten tot de host start...</div>`;
  else if(G.state=="question")h=ANS()[user.uid]?`<div class="center"><div class="big-msg">Antwoord verstuurd</div>Wachten op de anderen...</div>`:`<div class="stage"><div class="hbar"><div class="tcirc" id="tm"></div><b>${esc(q.text)}</b></div><div class="tbar"><div id="tb"></div></div><div class="agrid big">${q.a.map((t,i)=>`<button class="ans ${COL[i]}" data-a="ans" data-i="${i}"><span>${SYM[i]}</span><em>${esc(t)}</em></button>`).join("")}</div></div>`;
  else if(G.state=="reveal")h=`<div class="full ${me?.ok?"ok":"no"}"><div class="stage"><div class="big-msg">${me?.ok?"Goed! ✓":"Fout ✗"}</div>${me?.ok?`+${q.points} punten`:"Geen punten"}<p>Totaal: ${me?.score||0}</p></div></div>`;
  else if(G.state=="board")h=`<div class="center"><div class="big-msg">Plek ${rank}</div><div>${me?.score||0} punten</div></div>`;
  else h=`<div class="center"><div class="big-msg">${rank<=3?["🥇","🥈","🥉"][rank-1]:""} Plek ${rank}</div><div>${me?.score||0} punten</div><p>Wachten tot de host afsluit...</p></div>`}
 A.innerHTML=h;tick()}
