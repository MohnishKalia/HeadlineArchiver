import React, { useState } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';

import Highlight from '@material-ui/icons/Highlight';
import Public from '@material-ui/icons/Public';
import Search from '@material-ui/icons/Search';
import ViewHeadline from '@material-ui/icons/ViewHeadline';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import clsx from 'clsx';
import { getImageUrl, ViewProps } from '../utils';
import SearchView from './SearchView';
import TimelineView from './TimelineView';

const useStyles = makeStyles((theme) => ({
    menuButton: {
        display: 'block',
        margin: 'auto'
    },
    image: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImage: {
        maxWidth: '100%',
        height: 'auto',
    },
}));

export default function Main({ user }: Pick<ViewProps, 'user'>) {
    const [view, setView] = useState('timeline');

    const [open, setOpen] = useState(false);
    const [modalFileName, setMFN] = useState("");

    const classes = useStyles();

    function handleOpen(fileName: string) {
        setOpen(true);
        setMFN(fileName);
    }

    // not signed in
    if (!user)
        return (
            <Typography variant="body1" color="inherit" align="center">To access this service, please authenticate above</Typography>
        );

    return (
        <Grid container spacing={3} direction="column">
            <Grid container item alignItems="center">
                <Grid item xs={3}>
                    <Public className={classes.menuButton} color="inherit" fontSize="large" />
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h3" align="center">VS.</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Highlight className={classes.menuButton} color="inherit" fontSize="large" />
                </Grid>
            </Grid>

            <Grid item>
                <Typography variant="button" display="block" gutterBottom align="center">
                    Comparing CNN and Fox headlines
                </Typography>
                <Typography variant="overline" display="block" align="center">
                    Click or tap to expand image
                </Typography>
                <Typography variant="overline" display="block" align="center">
                    Select between timeline and search views
                </Typography>
            </Grid>

            <Grid container item justify="center">
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(_, view) => view && setView(view)}
                    aria-label="view"
                >
                    <ToggleButton value="timeline" aria-label="timeline">
                        <ViewHeadline />
                    </ToggleButton>
                    <ToggleButton value="search" aria-label="search">
                        <Search />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid item>
                <Divider />
            </Grid>

            {
                view === 'timeline'
                    ? <TimelineView user={user} handleOpen={handleOpen} />
                    : <SearchView user={user} handleOpen={handleOpen} />
            }

            <Modal
                className={classes.modal}
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <img src={getImageUrl(modalFileName)} className={clsx(classes.image, classes.modalImage)} alt="Current Screenshot" />
                </Fade>
            </Modal>
        </Grid>
    );
}
