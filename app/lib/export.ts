import { Property } from './statistics';
import * as XLSX from 'xlsx';

export function exportToCSV(properties: Property[], areaName: string) {
  const headers = [
    'Judul',
    'Properti',
    'Kamar',
    'Harga/Bulan (RM)',
    'Harga/Tahun (RM)',
    'Ukuran (sqft)',
    'Furnitur',
    'Link',
  ];

  const rows = properties.map((p) => [
    `"${p.title}"`,
    `"${p.propertyName}"`,
    p.bedroom,
    p.priceMonthly,
    p.priceYearly,
    p.sizeSquft,
    `"${p.furnitureStatus}"`,
    p.url,
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `SPEEDHOME_${areaName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(
  properties: Property[],
  statistics: any,
  areaName: string
) {
  const data = {
    area: areaName,
    exportedAt: new Date().toISOString(),
    statistics,
    properties,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `SPEEDHOME_${areaName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(
  properties: Property[],
  statistics: any,
  areaName: string
) {
  // Create workbook dengan multiple sheets
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary/Statistics
  const summaryData = [
    ['SPEEDHOME Price Intelligence Report', areaName],
    ['Exported at', new Date().toLocaleString()],
    [],
    ['Metric', 'Value'],
    ['Total Units Found', statistics.totalUnits],
    ['Average Price (RM)', Math.round(statistics.averagePrice)],
    ['Median Price (RM)', Math.round(statistics.medianPrice)],
    ['Most Common Price (RM)', statistics.modesPrice.join(', ')],
    ['Fair Price (RM)', statistics.fairPrice],
    ['Lowest Price (RM)', statistics.minPrice],
    ['Highest Price (RM)', statistics.maxPrice],
    ['Average Size (sqft)', Math.round(statistics.averageSize)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: All Listings
  const listingsData = [
    ['Judul', 'Properti', 'Kamar', 'Harga/Bulan (RM)', 'Harga/Tahun (RM)', 'Ukuran (sqft)', 'Furnitur', 'Link'],
    ...properties.map((p) => [
      p.title,
      p.propertyName,
      p.bedroom,
      p.priceMonthly,
      p.priceYearly,
      p.sizeSquft,
      p.furnitureStatus,
      p.url,
    ]),
  ];

  const listingsSheet = XLSX.utils.aoa_to_sheet(listingsData);
  // Set column widths
  listingsSheet['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(workbook, listingsSheet, 'Listings');

  // Sheet 3: Statistics by Bedroom
  if (statistics.byBedroom && statistics.byBedroom.length > 0) {
    const bedroomData = [
      ['Bedroom Type', 'Count', 'Average Price (RM)'],
      ...statistics.byBedroom.map((item: any) => [
        item.bedroom,
        item.count,
        Math.round(item.avgPrice),
      ]),
    ];

    const bedroomSheet = XLSX.utils.aoa_to_sheet(bedroomData);
    XLSX.utils.book_append_sheet(workbook, bedroomSheet, 'By Bedroom');
  }

  // Save file
  XLSX.writeFile(
    workbook,
    `SPEEDHOME_${areaName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  );
}
