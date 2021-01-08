import React, { useRef, useState } from 'react';

import { db, Timestamp } from '../firebase';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Highlight from '@material-ui/icons/Highlight';
import Public from '@material-ui/icons/Public';

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
        height: 140,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
}));


// TODO: change into an async function that gets access tokens and is used in getData
function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

export default function Main(props: { user: any }) {
    const [shots, setShots] = useState<Screenshot[]>([]);
    // const dummy = useRef<HTMLElement>(null!);
    const increment = useRef(3);
    const classes = useStyles();

    async function getData() {
        let query = db.collection('screenshots').orderBy('createdAt', 'desc').limit(increment.current);
        const lastElt = shots[shots.length - 1];
        if (lastElt)
            query = query.startAfter(lastElt.createdAt);
        const data = await query.get();

        const tempDtos: Screenshot[] = [];
        data.forEach(doc => tempDtos.push(doc.data() as Screenshot));

        setShots(shots.concat(tempDtos));
    }

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
                <Divider />
            </Grid>

            {shots.map(
                ({ createdAt, cnnFileName, foxFileName }, i) => (
                    <Grid container item xs={12} key={i} alignItems="center" className={classes.separator}>
                        <Grid item xs={3}>
                            <Card elevation={3}>
                                <CardActionArea>
                                    <CardMedia
                                        className={classes.image}
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
                                <CardActionArea>
                                    <CardMedia
                                        className={classes.image}
                                        image={getImageUrl(foxFileName)}
                                        title="Fox Screenshot"
                                    />
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                )
            )}

            <Grid item xs={12}>
                <Divider />
            </Grid>

            <Grid item xs={12}>
                <Button color="primary" onClick={() => getData()}>Get {increment.current} More</Button>
            </Grid>
        </Grid>
    );
}
