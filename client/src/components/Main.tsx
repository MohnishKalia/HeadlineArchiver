import React, { useEffect, useRef, useState } from 'react';

import { db, Timestamp } from '../firebase';

import { Button } from '@material-ui/core';

interface Screenshot {
    createdAt: Timestamp,
    cnnFileName: string,
    foxFileName: string,
}

// TODO: change into an async function that gets access tokens and is used in getData
function getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/headline-archiver.appspot.com/o/screenshots%2F${fileName}?alt=media`;
}

export default function Main(props: {user: any}) {
    const [shots, setShots] = useState<Screenshot[]>([]);
    // const dummy = useRef<HTMLElement>(null!);

    async function getData() {
        let query = db.collection('screenshots').orderBy('createdAt', 'desc').limit(10);
        const lastElt = shots[shots.length - 1];
        if (lastElt)
            query = query.startAfter(lastElt.createdAt);
        const data = await query.get();

        const tempDtos: Screenshot[] = [];
        data.forEach(doc => tempDtos.push(doc.data() as Screenshot));

        setShots(shots.concat(tempDtos));
    }

    return (
        <>
            {props.user && shots?.map(
                ({ createdAt, cnnFileName, foxFileName }, i) => (
                    <React.Fragment key={i}>
                        <p>Created At: {createdAt.toDate().toLocaleString()}</p>
                        <img src={getImageUrl(cnnFileName)} alt="cnn" />
                        <img src={getImageUrl(foxFileName)} alt="fox" />
                        <hr />
                    </React.Fragment>
                )
            )}
            {/* <div ref={dummy}></div> */}
            <Button color="primary" onClick={() => getData()}>Get 10 More</Button>
        </>
    );
}
