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

async function scrapeFurnishingDetails(
  page: any,
  properties: Array<Property & { needsFurnishing: boolean }>
): Promise<Property[]> {
  console.log(`🔍 Scraping furnishing details for ${properties.length} properties...`);

  const results: Property[] = [];

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    try {
      // Navigate to detail page
      await page.goto(prop.url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get page content and parse
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract furnishing dari amenities section (more specific than full page)
      const amenitiesEl = $('[class*="amenities"]');
      const amenitiesText = amenitiesEl.text() || '';

      let furnitureStatus = 'Not specified';

      // Check amenities section first (most accurate)
      if (amenitiesText.match(/fully\s+furnished/i)) {
        furnitureStatus = 'Fully Furnished';
      } else if (amenitiesText.match(/partially\s+furnished/i)) {
        furnitureStatus = 'Partially Furnished';
      } else if (amenitiesText.match(/unfurnished/i)) {
        furnitureStatus = 'Unfurnished';
      } else {
        // Fallback: check page title (e.g., "LSH33 Sentul KL | Studio Unfurnished #FQ")
        const pageTitle = await page.title();
        if (pageTitle.match(/unfurnished/i)) {
          furnitureStatus = 'Unfurnished';
        } else if (pageTitle.match(/furnished/i)) {
          furnitureStatus = 'Fully Furnished';
        }
      }

      results.push({
        ...prop,
        furnitureStatus,
      });

      console.log(`  ✓ ${i + 1}/${properties.length}: ${prop.propertyName} - ${furnitureStatus}`);
    } catch (error) {
      console.error(`  ✗ ${i + 1}/${properties.length}: Failed to scrape ${prop.propertyName}`);
      results.push({
        ...prop,
        furnitureStatus: 'Not specified',
      });
    }
  }

  return results;
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

    // Extract basic data dari setiap listing (tanpa furnishing dulu)
    const basicProperties: Array<Property & { needsFurnishing: boolean }> = [];

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
        let bedroom = 'Unknown';
        if (sizeMatch) {
          const afterSqft = fullText.substring(fullText.indexOf(sizeMatch[0]) + sizeMatch[0].length).trim();
          const bedMatch = afterSqft.match(/^\s*(\d+)\s+\d+\s+\d+/);
          if (bedMatch) {
            bedroom = `${bedMatch[1]}BR`;
          }
        }
        if (bedroom === 'Unknown') {
          if (fullText.toLowerCase().includes('shared') || fullText.includes('MEDIUM SHARED')) {
            bedroom = 'Shared';
          } else if (fullText.match(/\bstudio\b/i)) {
            bedroom = 'Studio';
          }
        }

        // Extract price
        const priceMonthMatch = fullText.match(/RM\s*([\d,]+)\s*\/\s*month/i);
        const priceMonthly = priceMonthMatch
          ? parseInt(priceMonthMatch[1].replace(/,/g, ''), 10)
          : 0;
        const priceFallbackMatch = !priceMonthMatch ? fullText.match(/RM\s*([\d,]+)/) : null;
        const priceMonthlyFallback = priceFallbackMatch
          ? parseInt(priceFallbackMatch[1].replace(/,/g, ''), 10)
          : 0;
        const finalPriceMonthly = priceMonthly || priceMonthlyFallback;

        const priceDaily = undefined;

        // Only add jika ada minimum data
        if (title && finalPriceMonthly > 0) {
          basicProperties.push({
            title,
            propertyName: title.split(',')[0]?.trim() || title,
            bedroom,
            priceMonthly: finalPriceMonthly,
            priceYearly: finalPriceMonthly * 12,
            priceDaily,
            sizeSquft,
            furnitureStatus: 'Loading...', // Will be updated
            url: `https://speedhome.com${href}`,
            needsFurnishing: true,
          });
        }
      } catch (e) {
        console.error(`Error parsing listing ${index}:`, e);
      }
    });

    console.log(`✅ Extracted ${basicProperties.length} basic property data`);

    // Now scrape furnishing from detail pages (limit to first 15 for performance)
    const propertiesWithFurnishing = await scrapeFurnishingDetails(
      page,
      basicProperties.slice(0, 15)
    );

    // Add remaining properties without furnishing (if >15)
    if (basicProperties.length > 15) {
      const remaining = basicProperties.slice(15).map(p => ({
        ...p,
        furnitureStatus: 'Not specified',
      }));
      propertiesWithFurnishing.push(...remaining);
    }

    await page.close();

    console.log(`✅ Successfully scraped ${propertiesWithFurnishing.length} properties from ${areaSlug}`);
    return propertiesWithFurnishing;
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
