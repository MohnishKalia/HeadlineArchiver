import React, { useEffect, useState } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';
import { getData, getImageUrl, getTimestampParts, Screenshot, ViewProps } from '../utils';

const useStyles = makeStyles((theme) => ({
    separator: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    image: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    cardImage: {
        height: 140,
    },
}));

export default function TimelineView({ user, handleOpen }: ViewProps) {
    const [shots, setShots] = useState<Screenshot[]>([]);
    const [lastShot, setLastShot] = useState<Screenshot>();

    const [ref, inView] = useInView({ delay: 300, rootMargin: '400px 0px' });
    const [eof, setEof] = useState(false);

    const classes = useStyles();

    useEffect(() => {
        async function query() {
            const newShots = await getData(lastShot);

            setEof(newShots.length === 0);
            setLastShot(newShots.slice(-1).pop());
            setShots(prev => prev.concat(newShots));
        }
        if (!eof && user && inView)
            query();
    }, [user, inView, eof, lastShot]);

    const sortedShots = shots.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return (
        <>
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
                            <Typography variant="subtitle2" align="center">{getTimestampParts(createdAt)[0]}</Typography>
                            <Typography variant="h6" align="center">{getTimestampParts(createdAt)[1]}</Typography>
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


            {eof && (
                <Grid item>
                    <Alert severity="info">
                        <AlertTitle>End of archives</AlertTitle>
                        Congratulations — you have <strong>reached the end of our records</strong>
                    </Alert>
                </Grid>
            )}

            <Grid item>
                <Divider ref={ref} />
            </Grid>
        </>
    );
}