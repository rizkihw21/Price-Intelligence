const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

async function scrapeSpeedhome(areaSlug) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = `https://speedhome.com/rent/${areaSlug}`;
    console.log(`📡 Scraping: ${url}\n`);

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();
    const $ = cheerio.load(html);

    // Focus on [class*="property"] elements
    const propertyElements = $('[class*="property"]');
    console.log(`✓ Found ${propertyElements.length} elements with "property" in class\n`);

    // Analyze first 5 elements
    console.log('=== ANALYZING FIRST 5 PROPERTY ELEMENTS ===\n');

    let validListings = 0;
    propertyElements.slice(0, 5).each((index, element) => {
      const $el = $(element);
      const html = $el.html();
      const text = $el.text();
      const className = $el.attr('class');

      console.log(`\n--- Element ${index + 1} ---`);
      console.log(`Class: ${className}`);
      console.log(`Text (first 150 chars): ${text.substring(0, 150)}`);
      console.log(`HTML (first 300 chars):\n${html?.substring(0, 300) || 'N/A'}`);

      // Check if element contains price (RM pattern)
      if (text.includes('RM') || text.match(/\d+/)) {
        console.log('✓ Looks like a listing (contains RM or numbers)');
        validListings++;
      }
    });

    console.log(`\n\n✓ Valid listings found: ${validListings} / 5 analyzed`);

    // Save full HTML dari first valid element untuk detailed analysis
    const firstValid = propertyElements.find((_, el) => $(el).text().includes('RM'));
    if (firstValid) {
      const firstValidHtml = $(firstValid).html();
      fs.writeFileSync('speedhome-first-listing.html', firstValidHtml, 'utf8');
      console.log('✅ First valid listing HTML saved to speedhome-first-listing.html');
    }

    await page.close();

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function test() {
  try {
    await scrapeSpeedhome('mont-kiara');
  } finally {
    if (browser) await browser.close();
  }
}

test();
