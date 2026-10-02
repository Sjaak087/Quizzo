/* Quizzo onderhoudsscherm. Zet enabled op false om het uit te schakelen. */
window.QUIZZO_MAINTENANCE={enabled:false,password:"Mijnsiteisbeter",storageKey:"quizzo_maintenance_bypass_v2"};
(function(){
 const cfg=window.QUIZZO_MAINTENANCE; if(!cfg?.enabled)return;
 const key=cfg.storageKey||"quizzo_maintenance_bypass_v2";
 try{if(sessionStorage.getItem(key)==="1")return}catch(_){}
 const mount=()=>{
  if(document.getElementById("quizzo-maintenance"))return;
  const o=document.createElement("div"); o.id="quizzo-maintenance";
  o.innerHTML=`<div class="maintenance-card"><div class="maintenance-icon">🛠️</div><div class="maintenance-kicker">QUIZZO</div><h1>Site tijdelijk buiten gebruik</h1><p>De site is tijdelijk buiten gebruik vanwege onderhoud.</p><button id="maintenanceLoginBtn" class="maintenance-login">Inloggen</button></div><div id="maintenanceLoginModal" class="maintenance-login-modal" hidden><form id="maintenanceLoginForm" class="maintenance-login-card"><div class="maintenance-kicker">ONDERHOUDSTOEGANG</div><h2>Inloggen</h2><input id="maintenancePassword" type="password" placeholder="Wachtwoord" autocomplete="current-password"><div id="maintenanceError" class="maintenance-error"></div><div class="maintenance-login-actions"><button type="button" id="maintenanceCancel" class="maintenance-cancel">Annuleren</button><button class="maintenance-submit">Doorgaan</button></div></form></div>`;
  document.body.appendChild(o);
  const modal=o.querySelector("#maintenanceLoginModal");
  o.querySelector("#maintenanceLoginBtn").onclick=()=>{modal.hidden=false;setTimeout(()=>o.querySelector("#maintenancePassword")?.focus(),0)};
  o.querySelector("#maintenanceCancel").onclick=()=>{modal.hidden=true};
  o.querySelector("#maintenanceLoginForm").onsubmit=e=>{e.preventDefault(); const ok=o.querySelector("#maintenancePassword").value===cfg.password; if(ok){try{sessionStorage.setItem(key,"1")}catch(_){} o.remove();document.documentElement.classList.remove("quizzo-maintenance-locked")}else{o.querySelector("#maintenanceError").textContent="Wachtwoord klopt niet."}};
  document.documentElement.classList.add("quizzo-maintenance-locked");
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
