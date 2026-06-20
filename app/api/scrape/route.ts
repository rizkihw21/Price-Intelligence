import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { scrapeSpeedhome, closeBrowser } from '../../lib/scraper';
import { Property } from '../../lib/statistics';

// Load cached data at request time
function getCachedData() {
  try {
    const cachedPath = join(process.cwd(), 'public', 'cached-properties.json');
    const data = readFileSync(cachedPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading cached data:', error);
    return {};
  }
}

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
  let dataSource = 'REAL'; // Track data source

  try {
    // 🔥 TRY REAL WEB SCRAPING dari SPEEDHOME.com
    console.log(`🔍 Attempting real scraping for: ${availableCity.name}`);
    properties = await scrapeSpeedhome(availableCity.slug);
    dataSource = 'REAL';
  } catch (scrapingError) {
    // FALLBACK: Use cached data
    console.log(`⚠️ Real scraping failed, using cached data: ${scrapingError instanceof Error ? scrapingError.message : 'Unknown error'}`);

    const cachedData = getCachedData();
    const cachedProperties = cachedData[availableCity.slug as keyof typeof cachedData];
    if (cachedProperties && cachedProperties.length > 0) {
      properties = cachedProperties as Property[];
      dataSource = 'CACHED';
      console.log(`✅ Using cached data: ${properties.length} properties from ${availableCity.name}`);
    } else {
      return NextResponse.json(
        {
          error: `No data available for "${availableCity.name}"`,
          message: 'Neither real-time scraping nor cached data is available.',
          availableCities: AVAILABLE_CITIES.slice(0, 10).map((c) => c.name),
        },
        { status: 404 }
      );
    }
  }

  if (properties.length === 0) {
    return NextResponse.json(
      {
        error: `No listings found for "${availableCity.name}"`,
        message: 'The area exists but no properties were found.',
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
    source: dataSource, // Show data source
    note: dataSource === 'CACHED' ? 'Using cached data due to scraping limitations' : 'Real-time data from SPEEDHOME.com',
  });

  // Close browser in background (don't block response)
  closeBrowser().catch(err => console.error('Error closing browser:', err));
}
