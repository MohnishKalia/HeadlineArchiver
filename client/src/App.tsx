import React from 'react';
import './App.css';
import { Button } from '@material-ui/core';

import firebase from 'firebase/app';
import 'firebase/firebase-storage';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDownloadURL } from 'react-firebase-hooks/storage';

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
const store = firebase.storage();

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <section>
                {user ? <MainView user={user} /> : <SignIn />}
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

function MainView(props: { user: any }) {
    return (
        <>
            <p>
                {JSON.stringify(props.user)}
            </p>
            <SignOut />
        </>
    );
}

function SignOut() {
    return auth.currentUser && (
        <Button color="primary" onClick={() => auth.signOut()}>Sign Out</Button>
    );
}

export default App;
