import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as puppeteer from 'puppeteer';

admin.initializeApp();

const db = admin.firestore();
const store = admin.storage();

export const getScreenshots = functions.pubsub.schedule('*/30 * * * *').onRun(async ctx => {
    const now = Date.now();
    
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    const newsSites = ["cnn", "fox"] as const;

    const payload: any = { createdAt: admin.firestore.Timestamp.fromDate(new Date(now)) };

    console.log('Starting scraping...');
    for (const site of newsSites) {
        const fileName = `${site}-${now}.jpg`;

        await page.goto(`https://${site === 'fox' ? 'foxnews' : site}.com`);
        await page.screenshot({
            path: `/tmp/${fileName}`,
            quality: 60,
            type: 'jpeg',
        });
        console.log(`${fileName} screenshot taken`);


        console.log(`Adding ${fileName} to storage...`);
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

    console.log('Adding data to firestore...');
    await db.collection('screenshots').add(payload);

    // Removing because it takes time and the only writable directory is /tmp
    // console.log('Removing images...')
    // for (const site of newsSites) {
    //     const fileName = `${site}-${now}.jpg`;
    //     await fs.promises.unlink(fileName);
    //     console.log(`${fileName} screenshot removed`);
    // }
});
