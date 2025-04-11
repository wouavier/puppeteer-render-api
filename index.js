const express = require('express');
const puppeteer = require('puppeteer-core');
const { executablePath } = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing ?url=');

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Optionnel : User-Agent pour ressembler à un vrai navigateur
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    // Aller sur la page avec timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 20000 // 20 secondes
    });

    // Extraire les données
    const data = await page.evaluate(() => ({
      titre: document.querySelector('h1')?.innerText || 'Titre introuvable',
      contenu: document.querySelector('.job-offer__details')?.innerText || 'Contenu introuvable'
    }));

    await browser.close();
    res.json(data);

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    res.status(500).json({
      error: 'Scraping échoué',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Puppeteer API listening on port ${PORT}`);
});
