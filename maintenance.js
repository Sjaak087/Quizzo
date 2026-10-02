/*
  Quizzo onderhoudsscherm
  Zet enabled op true om het volledige scherm voor alle bezoekers te blokkeren.
  Zet enabled op false om het onderhoudsscherm volledig uit te schakelen.

  Let op: dit is een client-side toegangspoort. Het is bedoeld voor een tijdelijk
  onderhoudsscherm, niet als echte beveiliging van gevoelige gegevens.
*/
window.QUIZZO_MAINTENANCE = {
  enabled: true,
  password: "Mijnsiteisbeter",
  rememberUnlock: false
};

(function () {
  "use strict";

  var cfg = window.QUIZZO_MAINTENANCE || {};
  var KEY = "quizzo-maintenance-unlocked";
  var unlocked = false;

  try {
    unlocked = cfg.rememberUnlock && localStorage.getItem(KEY) === "1";
  } catch (_) {}

  window.quizzoMaintenanceState = {
    enabled: cfg.enabled === true,
    unlocked: unlocked
  };

  if (cfg.enabled !== true || unlocked) return;

  var style = document.createElement("style");
  style.id = "quizzo-maintenance-style";
  style.textContent = `
    html.quizzo-maintenance-lock, html.quizzo-maintenance-lock body {
      overflow: hidden !important;
    }
    #quizzo-maintenance {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: 24px;
      box-sizing: border-box;
      background:
        radial-gradient(circle at 50% 8%, rgba(255,255,255,.12), transparent 32%),
        linear-gradient(145deg, #32106f 0%, #46178f 52%, #2a0b61 100%);
      color: #fff;
      font-family: Montserrat, Arial, sans-serif;
      text-align: center;
    }
    .quizzo-maintenance-card {
      width: min(760px, calc(100vw - 32px));
      padding: clamp(28px, 6vw, 64px) clamp(24px, 6vw, 72px);
      box-sizing: border-box;
      border-radius: 28px;
      background: rgba(255,255,255,.98);
      color: #241a33;
      box-shadow: 0 24px 80px rgba(0,0,0,.30), 0 7px 0 rgba(0,0,0,.14);
      border: 1px solid rgba(255,255,255,.75);
    }
    .quizzo-maintenance-icon {
      width: 82px;
      height: 82px;
      margin: 0 auto 22px;
      display: grid;
      place-items: center;
      border-radius: 24px;
      background: #46178f;
      color: #fff;
      font-size: 38px;
      box-shadow: 0 8px 0 rgba(70,23,143,.18);
    }
    .quizzo-maintenance-card h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 52px);
      line-height: 1.05;
      letter-spacing: -.035em;
    }
    .quizzo-maintenance-card p {
      margin: 16px auto 0;
      max-width: 560px;
      color: #6c6277;
      font-size: clamp(16px, 2vw, 20px);
      line-height: 1.5;
      font-weight: 700;
    }
    .quizzo-maintenance-login {
      position: fixed;
      left: 50%;
      bottom: 16px;
      transform: translateX(-50%);
      z-index: 2147483648;
      border: 0;
      border-radius: 12px;
      padding: 9px 16px;
      background: rgba(255,255,255,.13);
      color: rgba(255,255,255,.92);
      font: 800 13px/1 Montserrat, Arial, sans-serif;
      cursor: pointer;
      backdrop-filter: blur(7px);
      box-shadow: 0 5px 18px rgba(0,0,0,.18);
    }
    .quizzo-maintenance-login:hover { background: rgba(255,255,255,.22); }
    .quizzo-maintenance-modal {
      position: fixed;
      inset: 0;
      z-index: 2147483649;
      display: none;
      place-items: center;
      padding: 20px;
      background: rgba(10,4,29,.64);
    }
    .quizzo-maintenance-modal.open { display: grid; }
    .quizzo-maintenance-dialog {
      width: min(430px, calc(100vw - 36px));
      padding: 24px;
      border-radius: 20px;
      background: #fff;
      color: #241a33;
      box-shadow: 0 20px 60px rgba(0,0,0,.35);
      box-sizing: border-box;
      text-align: left;
    }
    .quizzo-maintenance-dialog h2 { margin: 0 0 7px; font-size: 24px; }
    .quizzo-maintenance-dialog p { margin: 0 0 16px; color: #71687b; font-weight: 700; }
    .quizzo-maintenance-dialog input {
      width: 100%;
      box-sizing: border-box;
      border: 2px solid #ded9e7;
      border-radius: 12px;
      padding: 13px 14px;
      font: 800 16px/1.2 Montserrat, Arial, sans-serif;
      outline: 0;
    }
    .quizzo-maintenance-dialog input:focus {
      border-color: #46178f;
      box-shadow: 0 0 0 4px rgba(70,23,143,.10);
    }
    .quizzo-maintenance-actions {
      display: flex;
      gap: 9px;
      justify-content: flex-end;
      margin-top: 14px;
    }
    .quizzo-maintenance-actions button {
      border: 0;
      border-radius: 11px;
      padding: 11px 15px;
      font: 900 14px/1 Montserrat, Arial, sans-serif;
      cursor: pointer;
    }
    .quizzo-maintenance-cancel { background: #eeeaf3; color: #4f4458; }
    .quizzo-maintenance-submit { background: #46178f; color: #fff; }
    .quizzo-maintenance-error {
      min-height: 19px;
      margin-top: 9px;
      color: #bd2f4c;
      font-size: 12px;
      font-weight: 900;
    }
    @media (max-width: 600px) {
      .quizzo-maintenance-card { border-radius: 22px; }
      .quizzo-maintenance-icon { width: 68px; height: 68px; border-radius: 20px; font-size: 31px; }
      .quizzo-maintenance-login { bottom: 10px; }
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add("quizzo-maintenance-lock");

  var overlay = document.createElement("div");
  overlay.id = "quizzo-maintenance";
  overlay.innerHTML = `
    <section class="quizzo-maintenance-card" aria-labelledby="quizzo-maintenance-title">
      <div class="quizzo-maintenance-icon" aria-hidden="true">🔧</div>
      <h1 id="quizzo-maintenance-title">Site tijdelijk buiten gebruik</h1>
      <p>We zijn momenteel onderhoud aan het uitvoeren. Probeer het later opnieuw.</p>
    </section>
    <button class="quizzo-maintenance-login" type="button">Inloggen</button>
    <div class="quizzo-maintenance-modal" role="dialog" aria-modal="true" aria-labelledby="quizzo-maintenance-login-title">
      <form class="quizzo-maintenance-dialog">
        <h2 id="quizzo-maintenance-login-title">Onderhoudstoegang</h2>
        <p>Log in om de site tijdens het onderhoud te openen.</p>
        <input type="password" name="password" autocomplete="current-password" placeholder="Wachtwoord" aria-label="Wachtwoord" />
        <div class="quizzo-maintenance-error" aria-live="polite"></div>
        <div class="quizzo-maintenance-actions">
          <button class="quizzo-maintenance-cancel" type="button">Annuleren</button>
          <button class="quizzo-maintenance-submit" type="submit">Inloggen</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  var loginBtn = overlay.querySelector(".quizzo-maintenance-login");
  var modal = overlay.querySelector(".quizzo-maintenance-modal");
  var form = overlay.querySelector("form");
  var input = overlay.querySelector("input");
  var error = overlay.querySelector(".quizzo-maintenance-error");
  var cancel = overlay.querySelector(".quizzo-maintenance-cancel");

  function closeLogin() {
    modal.classList.remove("open");
    error.textContent = "";
    input.value = "";
  }

  function unlock() {
    try {
      if (cfg.rememberUnlock) localStorage.setItem(KEY, "1");
    } catch (_) {}
    window.quizzoMaintenanceState.unlocked = true;
    document.documentElement.classList.remove("quizzo-maintenance-lock");
    overlay.remove();
    var maintenanceStyle = document.getElementById("quizzo-maintenance-style");
    if (maintenanceStyle) maintenanceStyle.remove();
  }

  loginBtn.addEventListener("click", function () {
    modal.classList.add("open");
    setTimeout(function () { input.focus(); }, 0);
  });

  cancel.addEventListener("click", closeLogin);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeLogin();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (String(input.value || "") === String(cfg.password || "")) {
      unlock();
    } else {
      error.textContent = "Onjuist wachtwoord.";
      input.select();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeLogin();
  });
})();
