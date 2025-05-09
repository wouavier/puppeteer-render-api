# ✅ Dockerfile Render pour Puppeteer avec Chromium Sparticuz
FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
  wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 \
  libxrandr2 xdg-utils libu2f-udev libvulkan1 libxss1 --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install

ENV PORT=10000

CMD ["node", "index.js"]
