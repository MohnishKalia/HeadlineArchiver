import './App.css';

import { Button, Container } from '@material-ui/core';

import { auth, GoogleAuthProvider } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import Header from './components/Header';
import Main from './components/Main';

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };
    return (
        <Button color="inherit" onClick={signInWithGoogle}>Sign in With Google</Button>
    );
}

function SignOut() {
    return (
        <Button color="inherit" onClick={() => auth.signOut()}>Sign Out</Button>
    );
}

export default function App() {
    const [user] = useAuthState(auth);
    return (
        <>
            <Header>
                {user ? <SignOut/> : <SignIn/>}
            </Header>
            <Container maxWidth="lg">
                <Main user={user} />
            </Container>
        </>
    );
}
