import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';
import 'firebase/performance';

firebase.initializeApp({
    apiKey: "AIzaSyAqJ3rBF_ynBL0_v-d8khudDauw6Ug-1PA",
    authDomain: "headline-archiver.firebaseapp.com",
    projectId: "headline-archiver",
    storageBucket: "headline-archiver.appspot.com",
    messagingSenderId: "480490227527",
    appId: "1:480490227527:web:f6368a0133dc2657086e62",
    measurementId: "G-FXPZWXD7HJ"
});

export const aly = firebase.analytics();
export const perf = firebase.performance();
export const auth = firebase.auth();
export const db = firebase.firestore();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

export async function getData(lastElt?: Screenshot, ) {
    let query = db.collection('screenshots').orderBy('createdAt', 'desc').limit(6);
    if (lastElt)
        query = query.startAfter(lastElt.createdAt);
    const data = await query.get();

    const tempShots: Screenshot[] = [];
    data.forEach(doc => tempShots.push(doc.data() as Screenshot));

    return tempShots;
}

export type Timestamp = firebase.firestore.Timestamp;
export type User = firebase.User;
export interface Screenshot {
    createdAt: Timestamp,
    cnnFileName: string,
    foxFileName: string,
}
