import puppeteer from 'puppeteer-core';
import fs from 'fs';
import admin from 'firebase-admin'

const serviceAccount = require('./headline-archiver-secret.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'headline-archiver.appspot.com',
});

const db = admin.firestore();
const store = admin.storage();

async function getScreenshots() {
    try {
        const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });

        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 768 });

        const now = Date.now();
        const newsSites = ["cnn", "fox"] as const;

        const payload: any = { createdAt: admin.firestore.Timestamp.fromDate(new Date(now)) };

        console.log('Starting scraping...');
        for (const site of newsSites) {
            const fileName = `${site}-${now}.jpg`;

            await page.goto(`https://${site === 'fox' ? 'foxnews' : site}.com`);
            await page.screenshot({
                path: fileName,
                quality: 60,
                type: 'jpeg',
            });
            console.log(`${fileName} screenshot taken`);


            console.log(`Adding ${fileName} to storage...`);
            await store.bucket().upload(fileName, {
                destination: `screenshots/${fileName}`,
                gzip: true,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });

            payload[`${site}FileName`] = fileName;
        }
        
        await browser.close();

        console.log('Adding data to firestore...');
        await db.collection('screenshots').add(payload);

        console.log('Removing images...')
        for (const site of newsSites) {
            const fileName = `${site}-${now}.jpg`;
            await fs.promises.unlink(fileName);
            console.log(`${fileName} screenshot removed`);
        }

    } catch (error) {
        console.error(error);
    }
}

getScreenshots();