const puppeteer = require('puppeteer');

async function testFurnishingScrape() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Scrape a detail page to see actual furnishing text
  const detailUrls = [
    'https://speedhome.com/details/lsh33-sentul-kuala-lumpur-kqlivnfq',
    'https://speedhome.com/details/riana-dutamas-savio-sraetfwb',
    'https://speedhome.com/details/savvy-riana-dutamas-2-segambut-lhvlldkz'
  ];

  for (let i = 0; i < detailUrls.length; i++) {
    try {
      console.log(`\n🔍 Scraping: ${detailUrls[i]}`);
      await page.goto(detailUrls[i], { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const html = await page.content();

      // Find all text that might contain furnishing info
      const furnishingPatterns = [
        /fully\s*furnished/i,
        /partially\s*furnished/i,
        /unfurnished/i,
        /furnished/i,
        /semi\s*furnished/i,
        /unfurnish/i,
        /without\s*furniture/i,
        /furniture/i
      ];

      const pageText = html.toLowerCase();

      console.log(`📄 Page title: ${await page.title()}`);

      // Check for each pattern
      for (const pattern of furnishingPatterns) {
        const match = pageText.match(pattern);
        if (match) {
          console.log(`✓ Found: "${match[0]}" (pattern: ${pattern})`);
        }
      }

      // Also look for specific sections that might contain furnishing
      const commonSelectors = [
        '[class*="furniture"]',
        '[class*="furnish"]',
        '[class*="amenities"]',
        '[class*="property"]',
        '[class*="detail"]',
        '.amenity-list',
        '.property-features'
      ];

      // Extract text from these sections
      for (const selector of commonSelectors) {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const text = await elements[0].evaluate(el => el.textContent);
          console.log(`\n🔧 Section "${selector}":\n${text.substring(0, 200)}...`);
        }
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  await browser.close();
}

testFurnishingScrape().catch(console.error);
