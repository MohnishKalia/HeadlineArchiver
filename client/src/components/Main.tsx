import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Timestamp, Screenshot, getData } from '../utils';

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

import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';

import Highlight from '@material-ui/icons/Highlight';
import Public from '@material-ui/icons/Public';

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
    const [shots, setShots] = useState(new Map<Timestamp, Screenshot>());
    const [lastShot, setLastShot] = useState<Screenshot>();

    const [open, setOpen] = React.useState(false);
    const [modalFileName, setMFN] = React.useState("");

    const [ref, inView] = useInView({ delay: 300, rootMargin: '400px 0px' });
    const [eof, setEof] = useState(false);

    const classes = useStyles();

    function handleOpen(fileName: string) {
        setOpen(true);
        setMFN(fileName);
    }

    const sortedShots = Array.from(shots.values()).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    useEffect(() => {
        async function query() {
            const newShots = await getData(lastShot);

            setEof(newShots.length === 0);
            setShots(prev => {
                const temp = new Map(prev);
                newShots.forEach(shot => temp.set(shot.createdAt, shot));
                return temp;
            });
            setLastShot(newShots.slice(-1).pop());
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
        <Grid container spacing={3}>
            <Grid container item xs={12} alignItems="center">
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

            <Grid item xs={12}>
                <Typography variant="overline" display="block" gutterBottom align="center">
                    Comparing CNN and Fox headlines at a specific time, click or tap to expand image
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Divider />
            </Grid>

            {sortedShots.map(
                ({ createdAt, cnnFileName, foxFileName }, i) => (
                    <Grid container item xs={12} key={i} alignItems="center" className={classes.separator}>
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
            <Grid item xs={12}>
                <Alert severity="info">
                    <AlertTitle>End of archives</AlertTitle>
                    Congratulations — you have <strong>reached the end of our records</strong>
                </Alert>
            </Grid>}

            <Grid item xs={12}>
                <Divider ref={ref} />
            </Grid>
        </Grid>
    );
}
