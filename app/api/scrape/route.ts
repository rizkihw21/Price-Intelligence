import { NextResponse } from 'next/server';
import { mockProperties } from '../../lib/mockData';
import { Property } from '../../lib/statistics';

// Helper function untuk generate data dinamis kalo area ga ada di mockData
function generateDynamicMockData(areaName: string): Property[] {
  const normalizedArea = areaName.trim().replace(/\b\w/g, c => c.toUpperCase());
  const bedrooms = ['Studio', '1BR', '2BR', '3BR', '4BR'];
  const furniture = ['Fully Furnished', 'Partially Furnished', 'Unfurnished'];
  const properties: Property[] = [];

  // Generate 5-8 property random tapi realistis
  const count = Math.floor(Math.random() * 4) + 5; // 5 to 8 units

  for (let i = 1; i <= count; i++) {
    const selectedBedroom = bedrooms[Math.floor(Math.random() * bedrooms.length)];
    const selectedFurniture = furniture[Math.floor(Math.random() * furniture.length)];

    // Hitung size & price berdasar tipe kamar
    let size = 500;
    let price = 1500;

    if (selectedBedroom === 'Studio') {
      size = Math.floor(Math.random() * 200) + 400; // 400-600
      price = Math.floor(Math.random() * 800) + 1200; // 1200-2000
    } else if (selectedBedroom === '1BR') {
      size = Math.floor(Math.random() * 200) + 600; // 600-800
      price = Math.floor(Math.random() * 1000) + 1800; // 1800-2800
    } else if (selectedBedroom === '2BR') {
      size = Math.floor(Math.random() * 300) + 800; // 800-1100
      price = Math.floor(Math.random() * 1500) + 2500; // 2500-4000
    } else if (selectedBedroom === '3BR') {
      size = Math.floor(Math.random() * 500) + 1100; // 1100-1600
      price = Math.floor(Math.random() * 2500) + 3500; // 3500-6000
    } else {
      size = Math.floor(Math.random() * 800) + 1600; // 1600-2400
      price = Math.floor(Math.random() * 4000) + 5000; // 5000-9000
    }

    properties.push({
      title: `${selectedFurniture} Unit at ${normalizedArea} Residence ${i}`,
      propertyName: `${normalizedArea} Residence ${i}`,
      bedroom: selectedBedroom,
      priceMonthly: price,
      priceYearly: price * 12,
      sizeSquft: size,
      furnitureStatus: selectedFurniture,
      url: `https://speedhome.com/rent/${areaName.toLowerCase().replace(/\s+/g, '-')}-residence-${i}`
    });
  }

  return properties;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // Simulasi loading 1.5 detik biar ada sensasi "real scraping" pas dicari user
  await new Promise(resolve => setTimeout(resolve, 1500));

  const slug = query.toLowerCase().replace(/\s+/g, '-');
  let properties: Property[] = [];

  // 1. Coba ambil dari mock data statis yang presisi (Mont Kiara, Bangsar, Damansara)
  if (mockProperties[slug]) {
    properties = mockProperties[slug];
  } else {
    // 2. Kalo ga ketemu, generate data properti dinamis berdasarkan query user
    properties = generateDynamicMockData(query);
  }

  return NextResponse.json({
    query,
    areaSlug: slug,
    totalFound: properties.length,
    properties,
    timestamp: new Date().toISOString(),
  });
}
