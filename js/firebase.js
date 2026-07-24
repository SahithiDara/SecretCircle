// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8-K3UGvtSAzixnpj3E6pM1x1-0eOlQKQ",
  authDomain: "secret-circle-73b92.firebaseapp.com",
  projectId: "secret-circle-73b92",
  storageBucket: "secret-circle-73b92.firebasestorage.app",
  messagingSenderId: "883032651449",
  appId: "1:883032651449:web:a159616198f01b30740d68"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };