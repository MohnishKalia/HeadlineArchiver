import React, { useCallback, useState } from 'react';
import { getData, getTimestampParts, Screenshot, Timestamp, ViewProps } from '../utils';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { PropTypes } from '@material-ui/core';

import { DataGrid, ColDef, RowModel } from '@material-ui/data-grid';
import { DateTimePicker } from '@material-ui/pickers';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import Image from '@material-ui/icons/Image';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';

const useStyles = makeStyles((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(2),
        },
    },
    dataGrid: {
        marginBottom: theme.spacing(2),
    },
    cell: {
        justifyContent: 'center',
    },
}));

export default function SearchView({ user, handleOpen }: ViewProps) {
    const [shots, setShots] = useState<Screenshot[]>([]);
    const [lastShot, setLastShot] = useState<Screenshot>();

    const [startDate, setStartDate] = useState(new Date(Date.now() - (24 * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState(new Date());
    const [dateChanged, setDateChanged] = useState(false);

    const [error, setError] = useState('');

    const classes = useStyles();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const getShotData = useCallback(() => {
        async function query(last: Parameters<typeof getData>[0]) {
            const newShots = await getData(last, { startDate, endDate });

            setLastShot(prev => newShots.slice(-1).pop() ?? prev);
            setShots(prev => prev.concat(newShots));
        }

        const validSpan = startDate.getTime() <= endDate.getTime();

        if (validSpan) {
            if (dateChanged) {
                setShots([]);
                setLastShot(undefined);
                setDateChanged(false);
                // lastShot is stale here, will reference old value even though we updated state above, need explicit undefined
                query(undefined);
                setError('');
            } else
                query(lastShot);
        } else
            setError('Selected start and end dates were invalid.')
    }, [endDate, startDate, dateChanged, lastShot]);

    const createColumn = useCallback((field: string, headerName: string, color?: PropTypes.Color) => {
        const obj: ColDef = {
            field,
            headerName,
            disableClickEventBubbling: true,
            sortable: false,
            width: 300,
        };

        if (color) {
            obj.renderCell = (params) => matches
                ? (
                    <Button
                        variant="contained"
                        color={color}
                        onClick={() => handleOpen(params.value as string)}
                        startIcon={<Image />}
                    >
                        View Image
                    </Button>
                )
                : (
                    <IconButton
                        onClick={() => handleOpen(params.value as string)}
                        color={color}
                    >
                        <Image />
                    </IconButton>
                );
            obj.headerAlign = 'center';
            obj.cellClassName = classes.cell;
            obj.flex = 0.2;
        } else {
            obj.valueFormatter = (params) => matches
                ? getTimestampParts(params.value as Timestamp).join(", ")
                : (params.value as Timestamp).toDate().toLocaleString();
            obj.flex = 0.6
        }

        return obj;
    }, [matches, handleOpen, classes]);

    return (
        <>
            <Grid item>
                <form noValidate className={classes.form}>
                    <DateTimePicker
                        value={startDate}
                        onChange={date => {
                            if (date) { 
                                const newDate = date.toDate();
                                if (newDate.getTime() > endDate.getTime())
                                    return setError('Selected start date was invalid.');
                                if (startDate.getTime() !== newDate.getTime()) {
                                    setDateChanged(true);
                                    setStartDate(newDate);
                                    setError('');
                                }
                            }
                        }}
                        label="Start Date"
                        showTodayButton
                    />
                    <DateTimePicker
                        value={endDate}
                        onChange={date => {
                            if (date) { 
                                const newDate = date.toDate();
                                if (startDate.getTime() > newDate.getTime())
                                    return setError('Selected end date was invalid.');
                                if (endDate.getTime() !== newDate.getTime()) {
                                    setDateChanged(true);
                                    setEndDate(newDate);
                                    setError('');
                                }
                            }
                        }}
                        label="End Date"
                        showTodayButton
                    />
                    <Button
                        variant="contained"
                        color="default"
                        onClick={() => getShotData()}
                        startIcon={<Image />}
                    >
                        Get More Data
                    </Button>
                </form>
            </Grid>
            {error && (
                <Grid item>
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {error}
                    </Alert>
                </Grid>
            )}
            <Grid item>
                <div style={{ height: 425, width: '100%' }}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ flexGrow: 1 }}>
                            <DataGrid
                                columns={
                                    [
                                        createColumn('createdAt', 'Taken At'),
                                        createColumn('cnnFileName', 'CNN', 'secondary'),
                                        createColumn('foxFileName', 'Fox', 'primary'),
                                    ] as ColDef[]
                                }
                                rows={shots.map((shot, i) => ({ id: i, ...shot })) as RowModel[]}
                                pageSize={6}
                                disableSelectionOnClick
                                disableColumnMenu
                                disableColumnReorder
                                disableColumnSelector
                                disableColumnFilter
                                disableColumnResize
                            />
                        </div>
                    </div>
                </div>
            </Grid>
            <Grid item>
                <Divider />
            </Grid>
        </>
    );
}