import React, { useState, useEffect } from 'react';

import { db, Timestamp } from '../firebase';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Highlight from '@material-ui/icons/Highlight';
import Public from '@material-ui/icons/Public';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';

interface Screenshot {
    createdAt: Timestamp,
    cnnFileName: string,
    foxFileName: string,
}

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
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));


// TODO: change into an async function that gets access tokens and is used in getData
function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

export default function Main(props: { user: any }) {
    const [shots, setShots] = useState<Screenshot[]>([]);

    const [open, setOpen] = React.useState(false);
    const [modalFileName, setMFN] = React.useState("");
    
    const [ref, inView] = useInView({ delay: 500 });
    const [eof, setEof] = useState(false);

    const classes = useStyles();

    function handleOpen(fileName: string) {
        setOpen(true);
        setMFN(fileName);
    }

    useEffect(() => {
        async function getData() {
            let query = db.collection('screenshots').orderBy('createdAt', 'desc').limit(6);
            const lastElt = shots[shots.length - 1];
            if (lastElt)
                query = query.startAfter(lastElt.createdAt);
            const data = await query.get();

            const tempDtos: Screenshot[] = [];
            data.forEach(doc => tempDtos.push(doc.data() as Screenshot));
            
            if (tempDtos.length === 0)
                setEof(true);
            setShots(shots.concat(tempDtos));
        }
        if (!eof && props.user && inView)
            getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.user, inView, eof]);

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

            {shots.map(
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

            <Grid item xs={12}>
                <Divider ref={ref} />
            </Grid>

            {/* <Grid item xs={12}>
                <Button color="primary" onClick={() => getData()}>Get {increment.current} More</Button>
            </Grid> */}
        </Grid>
    );
}
