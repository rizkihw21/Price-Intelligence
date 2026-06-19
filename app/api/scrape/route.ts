import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedProperty {
  title: string;
  propertyName: string;
  bedroom: string;
  priceMonthly: number;
  priceYearly: number;
  sizeSquft: number;
  furnitureStatus: string;
  url: string;
}

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

function parseBedroom(bedroomStr: string): string {
  if (bedroomStr.toLowerCase().includes('studio')) return 'Studio';
  if (bedroomStr.includes('1')) return '1BR';
  if (bedroomStr.includes('2')) return '2BR';
  if (bedroomStr.includes('3')) return '3BR';
  if (bedroomStr.includes('4')) return '4BR';
  if (bedroomStr.includes('5')) return '5BR+';
  return bedroomStr;
}

function parseSize(sizeStr: string): number {
  const cleaned = sizeStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

async function scrapeSpeedhome(url: string): Promise<ScrapedProperty[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const properties: ScrapedProperty[] = [];

    // Multiple selector options (SPEEDHOME structure can vary)
    const selectors = [
      '.property-card',
      '.listing-item',
      '[data-testid="property-card"]',
      '.unit-card',
      'article',
    ];

    let foundCards = false;

    for (const selector of selectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        foundCards = true;
        cards.each((_, element) => {
          const $el = $(element);

          // Extract data with multiple fallback selectors
          const title =
            $el.find('h2, h3, .title, .listing-title').first().text().trim() ||
            $el.find('a').first().text().trim() ||
            'N/A';

          const location =
            $el.find('.location, .area, .property-name, .region').first().text().trim() ||
            'N/A';

          const bedroomText =
            $el.find('.bedroom, .room-type, .unit-type').first().text().trim() || 'Studio';
          const bedroom = parseBedroom(bedroomText);

          const priceMonthlyText =
            $el.find('.price-monthly, .price, [data-price-monthly]').first().text().trim() ||
            '0';
          const priceMonthly = parsePrice(priceMonthlyText);

          const priceYearlyText =
            $el.find('.price-yearly, .price-annual, [data-price-yearly]').first().text().trim() ||
            '0';
          const priceYearly = parsePrice(priceYearlyText);

          const sizeText =
            $el.find('.size, .sqft, .area-size, [data-size]').first().text().trim() || '0';
          const sizeSquft = parseSize(sizeText);

          const furnitureStatus =
            $el.find('.furniture, .furnished-status').first().text().trim() ||
            'Not specified';

          const urlPath = $el.find('a').attr('href') || '';
          const fullUrl = urlPath.startsWith('http')
            ? urlPath
            : `https://speedhome.com${urlPath}`;

          if (title !== 'N/A' && priceMonthly > 0) {
            properties.push({
              title,
              propertyName: location,
              bedroom,
              priceMonthly,
              priceYearly: priceYearly || priceMonthly * 12,
              sizeSquft,
              furnitureStatus,
              url: fullUrl,
            });
          }
        });
        break; // Exit loop if we found cards
      }
    }

    return properties;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // Build SPEEDHOME URL from query
    const areaSlug = query.toLowerCase().replace(/\s+/g, '-');
    const url = `https://speedhome.com/rent/${areaSlug}`;

    const properties = await scrapeSpeedhome(url);

    return NextResponse.json({
      query,
      areaSlug,
      totalFound: properties.length,
      properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
