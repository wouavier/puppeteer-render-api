// 🧠 index.js complet pour usage Puppeteer dans N8N + Optimisations anti-bot
const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cookie = require('cookie');

const app = express();
const PORT = process.env.PORT || 3000;

// Pour activer CORS si besoin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

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

    // 🧠 Améliorations pour contourner les protections anti-bot
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    // Cookies préliminaires (ex : Apec)
    const cookies = await page.cookies(url);

    // Chargement de la page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Pause + scroll simulé
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const fullText = await page.evaluate(() => document.body.innerText);
    const title = await page.title();
    const canonical = await page.evaluate(() => {
      const link = document.querySelector("link[rel='canonical']");
      return link ? link.href : window.location.href;
    });

    await browser.close();

    res.json({
      success: true,
      parsedData: {
        titre: title,
        url: canonical,
      },
      rawText: fullText,
      cookies
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Puppeteer server running on port ${PORT}`);
});
