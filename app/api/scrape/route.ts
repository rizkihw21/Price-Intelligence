import { NextResponse } from 'next/server';
import { scrapeSpeedhome, closeBrowser } from '../../lib/scraper';
import { Property } from '../../lib/statistics';

// Daftar area/kota valid yang didukung SPEEDHOME di Malaysia
const AVAILABLE_CITIES = [
  { slug: 'mont-kiara', name: 'Mont Kiara' },
  { slug: 'bangsar', name: 'Bangsar' },
  { slug: 'damansara', name: 'Damansara' },
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur' },
  { slug: 'petaling-jaya', name: 'Petaling Jaya' },
  { slug: 'cyberjaya', name: 'Cyberjaya' },
  { slug: 'subang-jaya', name: 'Subang Jaya' },
  { slug: 'puchong', name: 'Puchong' },
  { slug: 'shah-alam', name: 'Shah Alam' },
  { slug: 'cheras', name: 'Cheras' },
  { slug: 'ampang', name: 'Ampang' },
  { slug: 'klcc', name: 'KLCC' },
  { slug: 'johor-bahru', name: 'Johor Bahru' },
  { slug: 'penang', name: 'Penang' },
  { slug: 'setapak', name: 'Setapak' },
  { slug: 'sentul', name: 'Sentul' }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required. Please search for a city name.' },
      { status: 400 }
    );
  }

  const slug = query.toLowerCase().replace(/\s+/g, '-');

  // Cek apakah kota yang dicari terdaftar di area operasi SPEEDHOME (Malaysia)
  const availableCity = AVAILABLE_CITIES.find((c) => c.slug === slug || slug.includes(c.slug) || c.slug.includes(slug));

  if (!availableCity) {
    return NextResponse.json(
      {
        error: `Area "${query}" is not available`,
        message: "SPEEDHOME only operates in Malaysia. Please search for Malaysian areas (e.g., Kuala Lumpur, Petaling Jaya, Cyberjaya, Mont Kiara). Areas outside Malaysia (e.g., Jakarta) are not supported.",
        availableCities: AVAILABLE_CITIES.slice(0, 10).map((c) => c.name),
        exampleSearches: ['Kuala Lumpur', 'Petaling Jaya', 'Cyberjaya', 'Mont Kiara', 'Bangsar'],
      },
      { status: 404 }
    );
  }

  let properties: Property[] = [];

  try {
    // 🔥 REAL WEB SCRAPING dari SPEEDHOME.com
    console.log(`🔍 Scraping real data from SPEEDHOME.com for: ${availableCity.name}`);
    properties = await scrapeSpeedhome(availableCity.slug);

    if (properties.length === 0) {
      return NextResponse.json(
        {
          error: `No listings found for "${availableCity.name}"`,
          message: 'The area exists but no properties were found. Try another area or check back later.',
          availableCities: AVAILABLE_CITIES.slice(0, 10).map((c) => c.name),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      query: availableCity.name,
      areaSlug: availableCity.slug,
      totalFound: properties.length,
      properties,
      timestamp: new Date().toISOString(),
      source: 'REAL_SCRAPE_SPEEDHOME', // Indicate real scraping
    });
  } catch (error) {
    console.error(`❌ Scraping error:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch data from SPEEDHOME for "${availableCity.name}"`,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  } finally {
    // Close browser di background (jangan block response)
    // Biar dapat di-close, tapi ga block HTTP response
    closeBrowser().catch(err => console.error('Error closing browser:', err));
  }
}
