import { Property } from './statistics';

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
