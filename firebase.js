import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {apiKey:"AIzaSyBcMZBiCtxDsIl57QYYa75G_VIzfnHIF9k",authDomain:"quiz-website-d4a8a.firebaseapp.com",projectId:"quiz-website-d4a8a",storageBucket:"quiz-website-d4a8a.firebasestorage.app",messagingSenderId:"1079994134013",appId:"1:1079994134013:web:130febd78a47fe5b8fbd94",measurementId:"G-444Z4M7FPF"};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app, "https://quiz-website-d4a8a-default-rtdb.europe-west1.firebasedatabase.app");

export {ref, get, set, update, remove, push, onValue, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
