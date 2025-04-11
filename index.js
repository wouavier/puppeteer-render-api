const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing ?url=' });

    let browser;

    try {
        browser = await puppeteer.launch({
            executablePath: await chromium.executablePath(),
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
        });

        const page = await browser.newPage();

        // Navigation vers l’URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Récupération du texte visible de la page
        const fullText = await page.evaluate(() => document.body.innerText || '');

        // Récupération des cookies
        const cookies = await page.cookies();

        const pageTitle = await page.title();

        res.json({
            success: true,
            parsedData: {
                title: pageTitle,
                url,
                fullText,
                note: "Pas de parser spécifique pour ce site."
            },
            cookies,
        });

    } catch (err) {
        console.error('Scraping error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
