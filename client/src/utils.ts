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

interface QueryOptions {
    startDate: Date, 
    endDate: Date
}

export async function getData(lastElt?: Screenshot, queryOpts?: QueryOptions) {
    let query = db.collection('screenshots').orderBy('createdAt', queryOpts ? 'asc' : 'desc').limit(6);
    
    if (lastElt)
        query = query.startAfter(lastElt.createdAt);
    if (queryOpts)
        query = query
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(queryOpts.startDate))
            .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(queryOpts.endDate))

    const data = await query.get();

    const tempShots: Screenshot[] = [];
    data.forEach(doc => tempShots.push(doc.data() as Screenshot));

    return tempShots;
}

export function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

/**
 * First is date string, second is time string
 * @param timestamp Google timestamp
 */
export function getTimestampParts(timestamp: Timestamp) {
    const date = timestamp.toDate();
    return [date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        , date.toLocaleTimeString()] as const;
}

export type Timestamp = firebase.firestore.Timestamp;
export type User = firebase.User;
export type Dis<T> = React.Dispatch<React.SetStateAction<T>>;
export interface Screenshot {
    createdAt: Timestamp,
    cnnFileName: string,
    foxFileName: string,
}
export interface ViewProps {
    user: User | null,
    handleOpen: (fileName: string) => void
}
