const express = require('express');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set a random User-Agent
        const userAgent = randomUserAgent.getRandom();
        await page.setUserAgent(userAgent);

        // Navigate to the target URL
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('video');

        // Scrape video sources
        const videoSources = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('video')).map(video => video.src);
        });

        await browser.close();

        // Return video sources as JSON
        res.json({ videoSources });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape video sources' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});