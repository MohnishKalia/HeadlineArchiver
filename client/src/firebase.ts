import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyAqJ3rBF_ynBL0_v-d8khudDauw6Ug-1PA",
    authDomain: "headline-archiver.firebaseapp.com",
    projectId: "headline-archiver",
    storageBucket: "headline-archiver.appspot.com",
    messagingSenderId: "480490227527",
    appId: "1:480490227527:web:f6368a0133dc2657086e62",
    measurementId: "G-FXPZWXD7HJ"
});

export const auth = firebase.auth();
export const db = firebase.firestore();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
export type Timestamp = firebase.firestore.Timestamp;
