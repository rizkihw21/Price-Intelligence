import { scrapeSpeedhome, closeBrowser } from './app/lib/scraper';

async function testScraper() {
  console.log('🧪 Testing scraper function...\n');

  try {
    // Test scrape Mont Kiara
    console.log('Testing: Mont Kiara');
    const montKiaraData = await scrapeSpeedhome('mont-kiara');
    console.log(`✅ Mont Kiara: ${montKiaraData.length} properties found\n`);
    if (montKiaraData.length > 0) {
      console.log('Sample listing:');
      console.log(JSON.stringify(montKiaraData[0], null, 2));
    }

    // Test scrape Bangsar
    console.log('\n\nTesting: Bangsar');
    const bangsarData = await scrapeSpeedhome('bangsar');
    console.log(`✅ Bangsar: ${bangsarData.length} properties found\n`);
    if (bangsarData.length > 0) {
      console.log('Sample listing:');
      console.log(JSON.stringify(bangsarData[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await closeBrowser();
    console.log('\n✅ Browser closed');
  }
}

testScraper();
