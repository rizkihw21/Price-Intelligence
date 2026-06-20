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

        // Extract text content
        const fullText = $card.text();

        // Extract size (format: "850 sqft")
        const sizeMatch = fullText.match(/(\d+)\s*sqft/i);
        const sizeSquft = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;

        // Extract bedrooms (format: "3 2 1" = 3BR, 2 bathrooms, 1 kitchen)
        // atau dalam text format seperti "3 Bedrooms"
        const bedroomMatch = fullText.match(/(\d+)\s+(?:Bedroom|BR|bedroom|br|Bed)/i);
        const bedroom = bedroomMatch ? `${bedroomMatch[1]}BR` : 'Unknown';

        // Extract price (format: "RM 1,700 / month" atau "RM XXX / day")
        const priceMonthMatch = fullText.match(/RM\s*([\d,]+)\s*\/\s*month/i);
        const priceMonthly = priceMonthMatch
          ? parseInt(priceMonthMatch[1].replace(/,/g, ''), 10)
          : 0;

        // Extract daily price jika ada (format: "RM XXX / day")
        const priceDayMatch = fullText.match(/RM\s*([\d,]+)\s*\/\s*day/i);
        const priceDaily = priceDayMatch
          ? parseInt(priceDayMatch[1].replace(/,/g, ''), 10)
          : undefined;

        // Extract furnishing status (look for keywords)
        let furnitureStatus = 'Unknown';
        if (fullText.toLowerCase().includes('fully furnished')) {
          furnitureStatus = 'Fully Furnished';
        } else if (fullText.toLowerCase().includes('partially furnished')) {
          furnitureStatus = 'Partially Furnished';
        } else if (fullText.toLowerCase().includes('unfurnished')) {
          furnitureStatus = 'Unfurnished';
        }

        // Only add jika ada minimum data (title & price)
        if (title && priceMonthly > 0) {
          properties.push({
            title,
            propertyName: title.split(',')[0]?.trim() || title,
            bedroom,
            priceMonthly,
            priceYearly: priceMonthly * 12,
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
