import React, { useState } from 'react';
import './App.css';

// import { collection, query, startAt, order, limit } from 'typesaurus';

import { Button } from '@material-ui/core';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'

import { useAuthState } from 'react-firebase-hooks/auth';

firebase.initializeApp({
    apiKey: "AIzaSyAqJ3rBF_ynBL0_v-d8khudDauw6Ug-1PA",
    authDomain: "headline-archiver.firebaseapp.com",
    projectId: "headline-archiver",
    storageBucket: "headline-archiver.appspot.com",
    messagingSenderId: "480490227527",
    appId: "1:480490227527:web:f6368a0133dc2657086e62",
    measurementId: "G-FXPZWXD7HJ"
});

const auth = firebase.auth();
const db = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <section>
                {user ? <MainView /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };
    return (
        <Button color="primary" onClick={signInWithGoogle}>Sign in With Google</Button>
    );
}

interface CA {
    createdAt: firebase.firestore.Timestamp,
}

interface Screenshot extends CA {
    cnnFileName: string,
    foxFileName: string,
}

interface DTO extends CA {
    cnnFilePath: string,
    foxFilePath: string,
}

function MainView() {
    const [dtos, setDtos] = useState<DTO[]>([]);

    async function getData() {
        let query = db.collection('screenshots').orderBy('createdAt', 'desc').limit(10);
        const lastElt = dtos[dtos.length - 1];
        query = lastElt ? query.startAfter(lastElt.createdAt) : query;
        const data = await query.get();

        const tempDtos: DTO[] = [];
        data.forEach(doc => {
            const temp = doc.data() as Screenshot;
            tempDtos.push({
                createdAt: temp.createdAt,
                cnnFilePath: getImageUrl(temp.cnnFileName),
                foxFilePath: getImageUrl(temp.foxFileName),
            });
        });
        
        setDtos(dtos.concat(tempDtos));
    }

    return (
        <>
            {dtos?.map(
                ({ createdAt, cnnFilePath, foxFilePath }, i) => (
                    <React.Fragment key={i}>
                        <p>Created At: {createdAt.toDate().toLocaleString()}</p>
                        <img src={cnnFilePath} alt="cnn" />
                        <img src={foxFilePath} alt="fox" />
                        <hr />
                    </React.Fragment>
                )
            )}
            <Button color="primary" onClick={() => getData()}>Get 10 More</Button>
            <SignOut />
        </>
    );
}

function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

function SignOut() {
    return auth.currentUser && (
        <Button color="primary" onClick={() => auth.signOut()}>Sign Out</Button>
    );
}

export default App;
