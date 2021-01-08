import React, { ReactNode } from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export default function Header(props: { children: ReactNode }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <SpeakerNotes />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Headline Archiver
                    </Typography>
                    {props.children}
                </Toolbar>
            </AppBar>
        </div>
    );
}
