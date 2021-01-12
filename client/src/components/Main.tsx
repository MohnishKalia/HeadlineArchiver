import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Screenshot, getData } from '../utils';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';

import Highlight from '@material-ui/icons/Highlight';
import Public from '@material-ui/icons/Public';
import ViewHeadline from '@material-ui/icons/ViewHeadline';
import Search from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
    separator: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    menuButton: {
        display: 'block',
        margin: 'auto'
    },
    image: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    cardImage: {
        height: 140,
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

function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

export default function Main(props: { user: any }) {
    const [view, setView] = useState('timeline');

    const [shots, setShots] = useState<Screenshot[]>([]);
    const [lastShot, setLastShot] = useState<Screenshot>();

    const [open, setOpen] = useState(false);
    const [modalFileName, setMFN] = useState("");

    const [ref, inView] = useInView({ delay: 300, rootMargin: '400px 0px' });
    const [eof, setEof] = useState(false);

    const classes = useStyles();

    function handleOpen(fileName: string) {
        setOpen(true);
        setMFN(fileName);
    }

    const sortedShots = shots.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    useEffect(() => {
        async function query() {
            const newShots = await getData(lastShot);

            setEof(newShots.length === 0);
            setLastShot(newShots.slice(-1).pop());
            setShots(prev => prev.concat(newShots));
        }
        if (!eof && props.user && inView)
            query();
    }, [props.user, inView, eof, lastShot]);

    // not signed in
    if (!props.user)
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

            {/* Need handleOpen as prop */}
            {sortedShots.map(
                ({ createdAt, cnnFileName, foxFileName }, i) => (
                    <Grid container item key={i} alignItems="center" className={classes.separator}>
                        <Grid item xs={3}>
                            <Card elevation={3}>
                                <CardActionArea onClick={() => handleOpen(cnnFileName)}>
                                    <CardMedia
                                        className={clsx(classes.image, classes.cardImage)}
                                        image={getImageUrl(cnnFileName)}
                                        title="CNN Screenshot"
                                    />
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" align="center">{createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                            <Typography variant="h6" align="center">{createdAt.toDate().toLocaleTimeString()}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Card elevation={5}>
                                <CardActionArea onClick={() => handleOpen(foxFileName)}>
                                    <CardMedia
                                        className={clsx(classes.image, classes.cardImage)}
                                        image={getImageUrl(foxFileName)}
                                        title="Fox Screenshot"
                                    />
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                )
            )}

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

            {eof &&
                <Grid item>
                    <Alert severity="info">
                        <AlertTitle>End of archives</AlertTitle>
                    Congratulations — you have <strong>reached the end of our records</strong>
                    </Alert>
                </Grid>}

            <Grid item>
                <Divider ref={ref} />
            </Grid>
        </Grid>
    );
}
