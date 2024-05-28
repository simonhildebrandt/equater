import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";

import {
  getAuth,
  sendSignInLinkToEmail,
  connectAuthEmulator,
  onAuthStateChanged,
  signOut,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithCustomToken
} from "firebase/auth";


import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  collection,
  query,
  where,
  onSnapshot,
  connectFirestoreEmulator,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch
} from "firebase/firestore"

// import { navigate } from './router';


const firebaseConfig = {
  apiKey: "AIzaSyB0bUUJD1PHM8-VpumuOYCWcLfWtvjEHwA",
  authDomain: "equater-49bb5.firebaseapp.com",
  projectId: "equater-49bb5",
  storageBucket: "equater-49bb5.appspot.com",
  messagingSenderId: "478560233138",
  appId: "1:478560233138:web:87de5dd0304719877e0bab"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// const db = initializeFirestore(app, {
//   localCache: persistentLocalCache({})
// });
const db = getFirestore(app);


export const host = SITE_URL ? SITE_URL : "http://127.0.0.1:9000" ;

if (!SITE_URL) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}


const noop = () => {};

function withUser() {
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState(null);

  useEffect(_ => {
    handleSigninLink()
    .then(setLoginData);
  }, []);

  useEffect(_ => {
    const unsub = onAuthStateChanged(auth, userData => {
      if (userData) {
        // const uid = user.uid;
        console.log("We got a user!", userData);
        setUser(userData);
      } else {
        console.log("We're userless")
        setUser(false);
      }
    });

    return unsub;
  }, [])

  return {user, loginData};
}

function sendSignInLink(email, next = '/') {
  console.log(`return to host ${host}/login`);
  const actionCodeSettings = {
    url: host + `/login?next=${encodeURIComponent(next)}`,
    handleCodeInApp: true
  };

  sendSignInLinkToEmail(auth, email, actionCodeSettings)
  .then(() => {
    console.log("sent!")
    window.localStorage.setItem('emailForSignIn', email);
  })
  .catch(err => console.error(err))
}

async function handleSigninLink() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    console.log("signin link!")

    const url = new URL(window.location.href);
    const next = url.searchParams.get('next') || '/';

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the associated email again. For example:
      // email = window.prompt('Please provide your email for confirmation');
      //throw "no email stored"
    }

    return signInWithEmailLink(auth, email, window.location.href)
    .then(async (result) => {
      // Clear email from storage.
      window.localStorage.removeItem('emailForSignIn');
      console.log("logged in!", result);

      await setupUser(result.user);

      return {next};
    })
    .catch((error) => {
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
      console.error("failed login", error)
    });
  } else {
    console.log("not sign in link")
  }

}

function setupUser({uid, email}) {
  return setDoc(doc(db, 'users', uid), { email })
  .then(res => console.log('created!', res))
}

async function logout() {
  return signOut(auth);
}


export {
  logout,
  sendSignInLink,
  handleSigninLink,
  withUser,
  // addRecord,
  // updateRecord,
  // deleteRecord,
  // useFirestoreCollection,
  // useFirestoreDocument,
  // batchUpdate
}
