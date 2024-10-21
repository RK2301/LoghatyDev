const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage"); // Import the storage module

const firebaseConfig = {
  apiKey: "AIzaSyCse1WHQnyOza59LLpR25EKgT386oDSpyQ",
  authDomain: "loghaty-99f1a.firebaseapp.com",
  projectId: "loghaty-99f1a",
  storageBucket: "loghaty-99f1a.appspot.com",
  messagingSenderId: "886470024969",
  appId: "1:886470024969:web:8946967975ee54b55a7dd8",
  measurementId: "G-YXBJ5YGDJK"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const storage = firebaseStorage.getStorage(firebaseApp); // Initialize Firebase Storage
//const analytics = getAnalytics(app);

// Create a storage reference from our storage service
const storageRef = firebaseStorage.ref(storage);

module.exports = { storage, firebaseConfig, storageRef };

