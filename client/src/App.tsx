import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';

import { Button, Container, Avatar } from '@material-ui/core';

import { auth, GoogleAuthProvider, User } from './firebase';
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

function SignOut(props: { name: string, url: string }) {
    return (
        <Button color="inherit" onClick={() => auth.signOut()}>
            <Avatar alt={props.name} src={props.url} style={{marginRight: '1rem'}} /> Sign Out
        </Button>
    );
}

export default function App() {
    const [user] = useAuthState(auth) as [User | null, any, any];
    return (
        <>
            <CssBaseline/>
            <Header>
                {user ? <SignOut name={user.displayName!} url={user.photoURL!} /> : <SignIn />}
            </Header>
            <Container maxWidth="lg">
                <Main user={user} />
            </Container>
        </>
    );
}
