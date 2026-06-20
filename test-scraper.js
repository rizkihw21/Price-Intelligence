// Test scraper untuk research SPEEDHOME.com HTML structure
const puppeteer = require('puppeteer');

async function testScrape() {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: false, // Set false untuk debug, bisa lihat browser-nya
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set user agent biar ga kena bot detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('📡 Navigating to SPEEDHOME Mont Kiara...');

  try {
    await page.goto('https://speedhome.com/rent/mont-kiara', {
      waitUntil: 'networkidle2',
      timeout: 60000 // 60 detik timeout
    });

    console.log('⏳ Waiting for content to load...');

    // Wait beberapa detik buat Cloudflare challenge selesai
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page title untuk verifikasi
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Get page HTML untuk analysis
    const html = await page.content();

    // Save HTML ke file untuk analysis
    const fs = require('fs');
    fs.writeFileSync('speedhome-page.html', html, 'utf8');
    console.log('✅ HTML saved to speedhome-page.html');

    // Screenshot untuk debug
    await page.screenshot({ path: 'speedhome-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved to speedhome-screenshot.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await browser.close();
  console.log('🏁 Done!');
}

testScrape();
