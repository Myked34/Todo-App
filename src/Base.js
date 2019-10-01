import Rebase from "re-base";
import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDpEaj9CUeJ_Wfn1JNmwrr2AK57Z5iCYM8",
  authDomain: "to-do-369e2.firebaseapp.com",
  databaseURL: "https://to-do-369e2.firebaseio.com"
});

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp };

export default base;
