import { NextResponse } from 'next/server';
import { mockProperties } from '../../lib/mockData';

// Daftar kota yang tersedia di SPEEDHOME
const AVAILABLE_CITIES = [
  { slug: 'mont-kiara', name: 'Mont Kiara' },
  { slug: 'bangsar', name: 'Bangsar' },
  { slug: 'damansara', name: 'Damansara' },
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

  // Cek apakah kota yang dicari tersedia
  const availableCity = AVAILABLE_CITIES.find((c) => c.slug === slug);

  if (!availableCity) {
    // Kembalikan error dengan daftar kota yang tersedia
    return NextResponse.json(
      {
        error: `Kota "${query}" tidak tersedia`,
        message: "Saat ini Price Intelligence hanya tersedia untuk kota-kota berikut:",
        availableCities: AVAILABLE_CITIES.map((c) => c.name),
        exampleSearches: [
          'Mont Kiara',
          'Bangsar',
          'Damansara',
        ],
      },
      { status: 404 }
    );
  }

  // Simulasi loading 1.5 detik biar ada sensasi "real scraping"
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const properties = mockProperties[slug] || [];

  if (properties.length === 0) {
    return NextResponse.json(
      {
        error: `Tidak ada data properti untuk ${availableCity.name}`,
        message: 'Silakan coba lagi nanti atau pilih kota lain.',
        availableCities: AVAILABLE_CITIES.map((c) => c.name),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    query: availableCity.name,
    areaSlug: slug,
    totalFound: properties.length,
    properties,
    timestamp: new Date().toISOString(),
  });
}
