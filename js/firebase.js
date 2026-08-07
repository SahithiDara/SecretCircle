// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
