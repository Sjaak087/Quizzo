/* Quizzo onderhoudsscherm.
   Zet enabled op true om het scherm voor iedereen te tonen.
   Zet enabled op false om de site normaal te openen.
   Er wordt bewust niets opgeslagen: na iedere nieuwe pagina-load moet je opnieuw inloggen.
*/
window.QUIZZO_MAINTENANCE = {
  enabled: true,
  password: "Mijnsiteisbeter"
};

(function(){
  const cfg=window.QUIZZO_MAINTENANCE;
  if(!cfg || !cfg.enabled) return;
  let unlocked=false;

  function create(){
    if(unlocked || document.getElementById('quizzo-maintenance')) return;
    document.documentElement.classList.add('quizzo-maintenance-locked');
    const overlay=document.createElement('div');
    overlay.id='quizzo-maintenance';
    overlay.innerHTML=`
      <div class="maintenance-screen">
        <div class="maintenance-card" role="dialog" aria-modal="true" aria-labelledby="maintenance-title">
          <div class="maintenance-logo">QUIZZO</div>
          <div class="maintenance-icon">🔧</div>
          <h1 id="maintenance-title">Site tijdelijk buiten gebruik</h1>
          <p>De site is tijdelijk buiten gebruik vanwege onderhoud.</p>
          <button type="button" class="maintenance-login-btn" id="maintenanceLoginBtn">Inloggen</button>
        </div>
      </div>
      <div class="maintenance-modal" id="maintenanceModal" hidden>
        <form class="maintenance-login-card" id="maintenanceLoginForm">
          <h2>Inloggen</h2>
          <p>Voer het wachtwoord in om de site toch te openen.</p>
          <input id="maintenancePassword" type="password" autocomplete="off" placeholder="Wachtwoord">
          <div class="maintenance-error" id="maintenanceError" aria-live="polite"></div>
          <div class="maintenance-actions">
            <button type="button" class="maintenance-cancel" id="maintenanceCancel">Annuleren</button>
            <button type="submit" class="maintenance-submit">Inloggen</button>
          </div>
        </form>
      </div>`;
    (document.body || document.documentElement).appendChild(overlay);

    const modal=overlay.querySelector('#maintenanceModal');
    const input=overlay.querySelector('#maintenancePassword');
    const error=overlay.querySelector('#maintenanceError');
    const open=()=>{modal.hidden=false;setTimeout(()=>input.focus(),0)};
    const close=()=>{modal.hidden=true;input.value='';error.textContent=''};

    overlay.querySelector('#maintenanceLoginBtn').addEventListener('click',open);
    overlay.querySelector('#maintenanceCancel').addEventListener('click',close);
    overlay.querySelector('#maintenanceLoginForm').addEventListener('submit',e=>{
      e.preventDefault();
      if(input.value===cfg.password){
        unlocked=true;
        document.documentElement.classList.remove('quizzo-maintenance-locked');
        overlay.remove();
      }else{
        error.textContent='Wachtwoord klopt niet.';
        input.focus(); input.select();
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',create,{once:true});
  else create();
})();
