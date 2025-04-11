const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing ?url=');

  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    const data = await page.evaluate(() => {
      return {
        titre: document.querySelector('h1')?.innerText || 'Titre non trouvé',
        description: document.querySelector('p')?.innerText || 'Description non trouvée',
      };
    });

    await browser.close();
    console.log('Scraping terminé');

    res.json(data);
  } catch (err) {
    console.error('Erreur scraping:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Puppeteer API running on http://localhost:${PORT}`);
});
