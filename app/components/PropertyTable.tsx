"use client";

interface Property {
  title: string;
  propertyName: string;
  bedroom: string;
  priceMonthly: number;
  priceYearly: number;
  sizeSquft: number;
  furnitureStatus: string;
  url: string;
}

interface PropertyTableProps {
  properties: Property[];
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Judul</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Properti</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Kamar</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Harga/Bulan</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Harga/Tahun</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Ukuran (sqft)</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Furnitur</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Link</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-blue-50 transition"
            >
              <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{prop.title}</td>
              <td className="px-4 py-3 text-gray-700 font-medium">{prop.propertyName}</td>
              <td className="px-4 py-3 text-center text-gray-700">{prop.bedroom}</td>
              <td className="px-4 py-3 text-right text-green-600 font-semibold">
                {formatPrice(prop.priceMonthly)}
              </td>
              <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                {formatPrice(prop.priceYearly)}
              </td>
              <td className="px-4 py-3 text-center text-gray-700">
                {prop.sizeSquft.toFixed(0)}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                  {prop.furnitureStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <a
                  href={prop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  🔗 View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {properties.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Tidak ada data properti
        </div>
      )}
    </div>
  );
}
