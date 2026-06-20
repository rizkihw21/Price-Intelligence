const puppeteer = require('puppeteer');

async function analyzeCardStructure() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.goto('https://speedhome.com/rent/mont-kiara', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const cards = await page.evaluate(() => {
    const cardElements = document.querySelectorAll('a.PropertyCard_propertyCard__V67Lp');
    return Array.from(cardElements).slice(0, 3).map(card => {
      const titleEl = card.querySelector('[class*="propertyTitle"]');
      const title = titleEl ? titleEl.textContent.trim() : '';

      const priceEl = card.querySelector('[class*="propertyPrice"]');
      const price = priceEl ? priceEl.textContent.trim() : '';

      const suffixEl = card.querySelector('[class*="priceSuffix"]');
      const suffix = suffixEl ? suffixEl.textContent.trim() : '';

      const detailsEl = card.querySelector('[class*="propertyCardDetails"]');
      const details = detailsEl ? detailsEl.textContent.trim() : '';

      const tagItems = card.querySelectorAll('[class*="tag__"]');
      const tagTexts = Array.from(tagItems).map(t => t.textContent.trim());

      const href = card.getAttribute('href') || '';
      const ariaLabel = card.getAttribute('aria-label') || '';

      return { title, price, suffix, details, tagTexts, href, ariaLabel, innerHTML: card.innerHTML.substring(0, 2000) };
    });
  });

  console.log('=== CARD ANALYSIS ===\n');
  cards.forEach((card, i) => {
    console.log('--- Card ' + (i+1) + ' ---');
    console.log(JSON.stringify(card, null, 2));
    console.log();
  });

  await browser.close();
}

analyzeCardStructure().catch(console.error);
