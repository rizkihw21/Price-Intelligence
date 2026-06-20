const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
    console.log(`📡 Scraping: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();
    const $ = cheerio.load(html);

    const properties = [];

    // Debug: log page structure
    console.log(`\n📊 Page title: ${$('title').text()}`);

    // Try different selectors untuk find listings
    const possibleSelectors = [
      '[class*="card"]',
      '[class*="listing"]',
      '[class*="property"]',
      'article',
      '.listing-item',
      '[data-property]'
    ];

    for (const selector of possibleSelectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`✓ Found ${count} elements with selector: ${selector}`);
        if (count > 0 && count < 100) {
          // Log first element HTML untuk analyze
          const firstHtml = $(selector).first().html();
          console.log(`First element HTML (first 500 chars):\n${firstHtml?.substring(0, 500) || 'N/A'}\n`);
        }
      }
    }

    // Try generic selector untuk all divs dengan class yang mungkin content
    const allCards = $('[class*="item"], [class*="card"]');
    console.log(`\n📈 Total potential listing containers: ${allCards.length}\n`);

    // Log sample HTML
    if (allCards.length > 0) {
      console.log('=== FIRST LISTING ELEMENT HTML ===');
      console.log(allCards.first().html()?.substring(0, 1000));
      console.log('=== END ===\n');
    }

    await page.close();

    return properties;
  } catch (error) {
    console.error(`❌ Scraping error for ${areaSlug}:`, error.message);
    throw error;
  }
}

async function testScraper() {
  console.log('🧪 Testing scraper on Mont Kiara...\n');

  try {
    await scrapeSpeedhome('mont-kiara');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) await browser.close();
    console.log('\n✅ Done');
  }
}

testScraper();
