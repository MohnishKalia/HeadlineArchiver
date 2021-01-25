import { useMemo } from 'react';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { auth, User } from './utils';
import { useAuthState } from 'react-firebase-hooks/auth';

import DateFnsUtils from '@date-io/moment'
import {
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import Header from './components/Header';
import Main from './components/Main';
import firebase from 'firebase';

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };
    return (
        <Button color="inherit" onClick={signInWithGoogle}>Sign in With Google</Button>
    );
}

function SignOut(props: { name: string, url: string }) {
    return (
        <Button color="inherit" onClick={() => auth.signOut()}>
            <Avatar alt={props.name} src={props.url} style={{ marginRight: '1rem' }} /> Sign Out
        </Button>
    );
}

export default function App() {
    const [user] = useAuthState(auth) as [User | null, any, any];

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(
        () =>
            createMuiTheme({
                palette: {
                    type: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <CssBaseline />
                <Header>
                    {user ? <SignOut name={user.displayName!} url={user.photoURL!} /> : <SignIn />}
                </Header>
                <Container maxWidth="lg">
                    <Main user={user} />
                </Container>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}
