import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import 'firebase-functions';

import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

admin.initializeApp();

const db = admin.firestore();
const store = admin.storage();

/**
 * Estimated execution time: 35 seconds
 */
export const getScreenshots = functions.runWith({ memory: '2GB' }).pubsub.schedule('*/30 * * * *').onRun(async _ => {
    const now = Date.now();

    function logWithTime(message: string) {
        console.log(`${message} | ${(Date.now() - now) / 1000}s`);
    }

    logWithTime('Starting puppeteer...')
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    const newsSites = ["cnn", "fox"] as const;

    const payload: any = { createdAt: admin.firestore.Timestamp.fromDate(new Date(now)) };

    logWithTime('Starting scraping...');
    for (const site of newsSites) {
        const fileName = `${site}-${now}.jpg`;

        await page.goto(`https://${site === 'fox' ? 'foxnews' : site}.com`);
        await page.screenshot({
            path: `/tmp/${fileName}`,
            quality: 60,
            type: 'jpeg',
        });
        logWithTime(`${fileName} screenshot taken`);


        logWithTime(`Adding ${fileName} to storage...`);
        await store.bucket().upload(`/tmp/${fileName}`, {
            destination: `screenshots/${fileName}`,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        payload[`${site}FileName`] = fileName;
    }

    await browser.close();

    logWithTime('Adding data to firestore...');
    await db.collection('screenshots').add(payload);

    logWithTime('Removing images...')
    for (const site of newsSites) {
        const fileName = `${site}-${now}.jpg`;
        await fs.promises.unlink(`/tmp/${fileName}`);
        logWithTime(`${fileName} screenshot removed`);
    }
});
