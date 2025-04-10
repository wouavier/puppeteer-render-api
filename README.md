
# Puppeteer Scraper API

This simple Node.js app exposes a `/scrape?url=...` endpoint that uses Puppeteer to extract job offer content from a given URL.

## Example

```
GET /scrape?url=https://emploi.acass.fr/offer/8913-MzA5Nzc1OA
```

### Response

```json
{
  "titre": "Job title",
  "contenu": "Job description..."
}
```
