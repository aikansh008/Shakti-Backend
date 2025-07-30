const puppeteer = require('puppeteer');

const scrapeData = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  await page.waitForSelector('.jsx-7cbb814d75c86232.resultbox_info', { timeout: 10000 });

  const data = await page.evaluate(() => {
    const results = [];
    const boxes = document.querySelectorAll('.jsx-7cbb814d75c86232.resultbox_info');
    boxes.forEach(box => {
      const nameElement = box.querySelector('.store-name') || box.querySelector('h2'); // Adjust this selector if needed
      const locationElement = box.querySelector('.cont_fl_addr') || box.querySelector('.address');
      const linkElement = box.querySelector('a');

      const name = nameElement ? nameElement.textContent.trim() : 'N/A';
      const location = locationElement ? locationElement.textContent.trim() : 'N/A';
      const link = linkElement ? linkElement.href : 'N/A';

      results.push({ name, location, link });
    });
    return results;
  });

  await browser.close();
  return data;
};

module.exports = scrapeData;
