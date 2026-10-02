/* Quizzo onderhoudsscherm — wijzig alleen enabled om het scherm aan/uit te zetten. */
window.QUIZZO_MAINTENANCE = {
  enabled: true,
  password: "Mijnsiteisbeter",
  storageKey: "quizzo_maintenance_bypass_v1"
};

(function(){
  const cfg=window.QUIZZO_MAINTENANCE;
  if(!cfg?.enabled)return;
  const KEY=cfg.storageKey||"quizzo_maintenance_bypass_v1";
  let unlocked=false;
  try{unlocked=sessionStorage.getItem(KEY)==="1"}catch(_){unlocked=false}
  if(unlocked)return;

  const mount=()=>{
    if(document.getElementById("quizzo-maintenance"))return;
    document.documentElement.classList.add("quizzo-maintenance-locked");
    const overlay=document.createElement("div");
    overlay.id="quizzo-maintenance";
    overlay.innerHTML=`
      <div class="maintenance-card" role="dialog" aria-modal="true" aria-labelledby="maintenance-title">
        <div class="maintenance-icon">🛠️</div>
        <div class="maintenance-kicker">QUIZZO</div>
        <h1 id="maintenance-title">Site tijdelijk buiten gebruik</h1>
        <p>De site is tijdelijk buiten gebruik vanwege onderhoud. Probeer het later opnieuw.</p>
        <button class="maintenance-login" type="button" id="maintenanceLoginBtn">Inloggen</button>
      </div>
      <div class="maintenance-login-modal" id="maintenanceLoginModal" hidden>
        <form class="maintenance-login-card" id="maintenanceLoginForm">
          <div class="maintenance-kicker">ONDERHOUDSTOEGANG</div>
          <h2>Inloggen</h2>
          <p>Voer het onderhoudswachtwoord in om de site toch te openen.</p>
          <input id="maintenancePassword" type="password" autocomplete="current-password" placeholder="Wachtwoord" aria-label="Wachtwoord">
          <div class="maintenance-error" id="maintenanceError" aria-live="polite"></div>
          <div class="maintenance-login-actions"><button type="button" class="maintenance-cancel" id="maintenanceCancel">Annuleren</button><button type="submit" class="maintenance-submit">Doorgaan</button></div>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    const modal=overlay.querySelector("#maintenanceLoginModal");
    const open=()=>{modal.hidden=false;setTimeout(()=>overlay.querySelector("#maintenancePassword")?.focus(),0)};
    const close=()=>{modal.hidden=true;overlay.querySelector("#maintenanceError").textContent="";overlay.querySelector("#maintenancePassword").value=""};
    overlay.querySelector("#maintenanceLoginBtn").addEventListener("click",open);
    overlay.querySelector("#maintenanceCancel").addEventListener("click",close);
    overlay.querySelector("#maintenanceLoginForm").addEventListener("submit",e=>{
      e.preventDefault();
      const value=overlay.querySelector("#maintenancePassword").value;
      if(value===cfg.password){
        try{sessionStorage.setItem(KEY,"1")}catch(_){ }
        unlocked=true;
        document.documentElement.classList.remove("quizzo-maintenance-locked");
        overlay.remove();
      }else{
        overlay.querySelector("#maintenanceError").textContent="Wachtwoord klopt niet.";
        overlay.querySelector("#maintenancePassword").select();
      }
    });
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();
