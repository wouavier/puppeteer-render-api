const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing ?url=');

  try {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const data = await page.evaluate(() => ({
      titre: document.querySelector('h1')?.innerText || null,
      description: document.querySelector('p, .description, .job-offer__details')?.innerText || null
    }));

    await browser.close();
    res.json(data);
  } catch (err) {
    console.error('❌ Scraping failed:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Puppeteer API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
