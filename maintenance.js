/* Quizzo onderhoudsscherm — verander alleen enabled. true = onderhoud aan, false = uit. */
window.QUIZZO_MAINTENANCE = {
  enabled: true,
  password: "Mijnsiteisbeter"
};

(function(){
  const cfg=window.QUIZZO_MAINTENANCE;
  if(!cfg?.enabled)return;
  let unlocked=false;

  const mount=()=>{
    if(unlocked || document.getElementById("quizzo-maintenance"))return;
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
          <input id="maintenancePassword" type="password" autocomplete="off" placeholder="Wachtwoord" aria-label="Wachtwoord">
          <div class="maintenance-error" id="maintenanceError" aria-live="polite"></div>
          <div class="maintenance-login-actions">
            <button type="button" class="maintenance-cancel" id="maintenanceCancel">Annuleren</button>
            <button type="submit" class="maintenance-submit">Doorgaan</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    const modal=overlay.querySelector("#maintenanceLoginModal");
    const input=overlay.querySelector("#maintenancePassword");
    const error=overlay.querySelector("#maintenanceError");
    const open=()=>{modal.hidden=false;setTimeout(()=>input?.focus(),0)};
    const close=()=>{modal.hidden=true;error.textContent="";input.value=""};

    overlay.querySelector("#maintenanceLoginBtn").addEventListener("click",open);
    overlay.querySelector("#maintenanceCancel").addEventListener("click",close);
    overlay.querySelector("#maintenanceLoginForm").addEventListener("submit",e=>{
      e.preventDefault();
      if(input.value===cfg.password){
        unlocked=true;
        document.documentElement.classList.remove("quizzo-maintenance-locked");
        overlay.remove();
      }else{
        error.textContent="Wachtwoord klopt niet.";
        input.select();
      }
    });
  };

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();
