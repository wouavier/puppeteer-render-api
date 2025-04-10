
const express = require('express');
const puppeteer = require('puppeteer-core');
const { executablePath } = puppeteer;

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing ?url=...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => ({
    titre: document.querySelector('h1')?.innerText,
    contenu: document.querySelector('.job-offer__details')?.innerText
  }));

  await browser.close();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`✅ Puppeteer API listening on port ${PORT}`);
});
