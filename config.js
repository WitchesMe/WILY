import firebase from 'firebase';
import 'firebase/firestore';
require('@firebase/firestore');

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDTpvGPvH5Gy56I0L6SX1RCoyxTbgqXt64",
  authDomain: "wireless-library-app.firebaseapp.com",
  databaseURL: "https://wireless-library-app.firebaseio.com",
  projectId: "wireless-library-app",
  storageBucket: "wireless-library-app.appspot.com",
  messagingSenderId: "1096963957348",
  appId: "1:1096963957348:web:3cab5456fbb6124d7ab571"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
