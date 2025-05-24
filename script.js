const puppeteer = require('puppeteer');

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const results = [];

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });

    // Wait for the elements to load
    await page.waitForSelector('.jsx-ee3d18659dbf4034');

    // Scrape the data
    const anchors = await page.$$eval('a.jsx-ee3d18659dbf4034', elements => elements.map(anchor => {
      const link = anchor.href.trim();
      const name = anchor.querySelector('.jsx-ee3d18659dbf4034')?.innerText.trim() || '';
      const location = anchor.querySelector('.jsx-ee3d18659dbf4034')?.innerText.trim() || '';
      return { name, location, link };
    }));

    results.push(...anchors);
    
  } catch (error) {
    results.push({ main_error: error.message });
  } finally {
    await browser.close();
  }

  return results;
}

// Export the function for use in other files
module.exports = scrapeData;
