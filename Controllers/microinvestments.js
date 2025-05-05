const puppeteer = require('puppeteer');

const scrapeData = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=UseChromiumNetworkService',
      '--disable-http2'
    ]
  });

  const page = await browser.newPage();

  // Set realistic user-agent and headers
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  // Navigate to the page
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the target element to appear
  await page.waitForSelector('a.jsx-ee3d18659dbf4034', { timeout: 5000 });

  // Extract data
  const data = await page.evaluate(() => {
    const results = [];
    const anchors = document.querySelectorAll('a.jsx-ee3d18659dbf4034');
    anchors.forEach((a) => {
      const name = a.innerText.trim();
      const link = a.href;
      
      // Extract location using the provided class for location
      const locationElement = a.querySelector('.jsx-ee3d18659dbf4034');
      const location = locationElement ? locationElement.innerText.trim() : 'N/A';

      results.push({ name, link, location });
    });
    return results;
  });

  await browser.close();
  return data;
};

module.exports = scrapeData;