import puppeteer from 'puppeteer';
// import fs from 'fs';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 768 });

        await page.goto('https://foxnews.com');
        await page.screenshot({
            path: 'foxnews.png',
        });
        await page.screenshot({
            path: 'foxnews100.jpg',
            quality: 100,
            type: 'jpeg',
        });
        await page.screenshot({
            path: 'foxnews60.jpg',
            quality: 60,
            type: 'jpeg',
        });

        // await fs.promises.unlink('foxnews.jpg');
        // await fs.promises.unlink('cnn.jpg');

        await browser.close();
    } catch (error) {
        console.error(error);
    }
})();