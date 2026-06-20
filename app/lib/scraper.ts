import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { Property } from './statistics';

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export async function scrapeSpeedhome(areaSlug: string): Promise<Property[]> {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = `https://speedhome.com/rent/${areaSlug}`;
    console.log(`📡 Scraping: ${url}`);

    // Navigate dengan timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait untuk content load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get page content
    const html = await page.content();

    // Parse dengan Cheerio
    const $ = cheerio.load(html);

    // Extract listings menggunakan selector dari analisis
    const properties: Property[] = [];

    // SPEEDHOME.com uses: PropertyCard_propertyCard__V67Lp class untuk listing cards
    const listings = $('a.PropertyCard_propertyCard__V67Lp');

    console.log(`Found ${listings.length} listings`);

    // Extract data dari setiap listing
    listings.each((index, element) => {
      try {
        const $card = $(element);

        // Extract dari aria-label: "View details for LSH33 Sentul, Kuala Lumpur"
        const ariaLabel = $card.attr('aria-label') || '';
        const href = $card.attr('href') || '';

        // Extract title dari aria-label
        const titleMatch = ariaLabel.match(/View details for (.+)/);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract text content & title
        const fullText = $card.text();

        // Extract details from PropertyCard_propertyCardDetails class
        const detailsText = $card.find('[class*="propertyCardDetails"]').text().trim();
        const useDetails = detailsText || fullText;

        // Extract size (format: "850 sqft")
        const sizeMatch = fullText.match(/(\d+)\s*sqft/i);
        const sizeSquft = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;

        // Extract bedrooms from detail text pattern: "...sqft  3 2 1Amenities..."
        // After "sqft", the numbers "X Y Z" = bedrooms, bathrooms, carparks
        let bedroom = 'Unknown';
        if (sizeMatch) {
          const afterSqft = fullText.substring(fullText.indexOf(sizeMatch[0]) + sizeMatch[0].length).trim();
          const bedMatch = afterSqft.match(/^\s*(\d+)\s+\d+\s+\d+/);
          if (bedMatch) {
            bedroom = `${bedMatch[1]}BR`;
          }
        }
        // Fallback: check for patterns if no sqft found
        if (bedroom === 'Unknown') {
          if (fullText.toLowerCase().includes('shared') || fullText.includes('MEDIUM SHARED')) {
            bedroom = 'Shared';
          } else if (fullText.match(/\bstudio\b/i)) {
            bedroom = 'Studio';
          }
        }

        // Extract price (format: "RM 1,700 / month")
        const priceMonthMatch = fullText.match(/RM\s*([\d,]+)\s*\/\s*month/i);
        const priceMonthly = priceMonthMatch
          ? parseInt(priceMonthMatch[1].replace(/,/g, ''), 10)
          : 0;
        // Fallback: extract standalone RM number
        const priceFallbackMatch = !priceMonthMatch ? fullText.match(/RM\s*([\d,]+)/) : null;
        const priceMonthlyFallback = priceFallbackMatch
          ? parseInt(priceFallbackMatch[1].replace(/,/g, ''), 10)
          : 0;
        const finalPriceMonthly = priceMonthly || priceMonthlyFallback;

        // Daily price not available on SPEEDHOME listing cards
        const priceDaily = undefined;

        // Furnishing status not available on SPEEDHOME listing cards
        // Only available on detail page (/details/...)
        const furnitureStatus = 'Not specified';

        // Only add jika ada minimum data (title & price)
        if (title && finalPriceMonthly > 0) {
          properties.push({
            title,
            propertyName: title.split(',')[0]?.trim() || title,
            bedroom,
            priceMonthly: finalPriceMonthly,
            priceYearly: finalPriceMonthly * 12,
            priceDaily,
            sizeSquft,
            furnitureStatus,
            url: `https://speedhome.com${href}`,
          });
        }
      } catch (e) {
        console.error(`Error parsing listing ${index}:`, e);
      }
    });

    await page.close();

    console.log(`✅ Successfully scraped ${properties.length} properties from ${areaSlug}`);
    return properties;
  } catch (error) {
    console.error(`❌ Scraping error for ${areaSlug}:`, error);
    throw new Error(`Failed to scrape ${areaSlug}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
