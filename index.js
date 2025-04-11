const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 3000;

// Fonction générique pour parser selon le domaine
const parseOffer = async (page, url) => {
    const hostname = new URL(url).hostname;

    if (hostname.includes('apec.fr')) {
        return await page.evaluate(() => {
            return {
                titre: document.querySelector('h1')?.innerText || '',
                entreprise: document.querySelector('[class*="societe"]')?.innerText || '',
                lieu: document.querySelector('[class*="lieu"]')?.innerText || '',
                typeContrat: document.querySelector('[class*="contrat"]')?.innerText || '',
                salaire: document.querySelector('[class*="salaire"]')?.innerText || '',
                datePublication: document.querySelector('[class*="date"]')?.innerText || '',
                description: document.querySelector('[class*="job-offer__details"]')?.innerText || '',
                url: window.location.href,
            };
        });
    }

    // Exemple de fallback générique (à personnaliser)
    return {
        titre: await page.title(),
        url: url,
        note: 'Pas de parser spécifique pour ce site.',
    };
};

app.get('/scrape', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing ?url=' });

    try {
        const browser = await puppeteer.launch({
            executablePath: await chromium.executablePath(),
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
        });

        const page = await browser.newPage();

        // Optionnel : cookies à injecter
        if (req.query.cookieName && req.query.cookieValue) {
            await page.setCookie({
                name: req.query.cookieName,
                value: req.query.cookieValue,
                domain: new URL(url).hostname,
            });
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const data = await parseOffer(page, url);
        const cookies = await page.cookies();

        await browser.close();

        res.json({
            success: true,
            parsedData: data,
            cookies: cookies,
        });

    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Puppeteer API running on port ${PORT}`);
});
