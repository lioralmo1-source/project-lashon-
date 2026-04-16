// הגדרות Firebase זמניות
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "project-lashon.firebaseapp.com",
  projectId: "project-lashon",
  storageBucket: "project-lashon.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:12345"
};

// אתחול Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
