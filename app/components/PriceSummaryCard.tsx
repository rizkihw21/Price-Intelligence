"use client";

interface PriceSummaryProps {
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalUnits: number;
  averageSize: number;
}

export default function PriceSummaryCard({
  averagePrice,
  medianPrice,
  minPrice,
  maxPrice,
  totalUnits,
  averageSize,
}: PriceSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
        <p className="text-gray-600 text-sm font-semibold">Total Unit</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{totalUnits}</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <p className="text-gray-600 text-sm font-semibold">Rata-rata Harga</p>
        <p className="text-2xl font-bold text-green-600 mt-2">{formatPrice(averagePrice)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
        <p className="text-gray-600 text-sm font-semibold">Median Harga</p>
        <p className="text-2xl font-bold text-purple-600 mt-2">{formatPrice(medianPrice)}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
        <p className="text-gray-600 text-sm font-semibold">Harga Terendah</p>
        <p className="text-2xl font-bold text-orange-600 mt-2">{formatPrice(minPrice)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
        <p className="text-gray-600 text-sm font-semibold">Harga Tertinggi</p>
        <p className="text-2xl font-bold text-red-600 mt-2">{formatPrice(maxPrice)}</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200">
        <p className="text-gray-600 text-sm font-semibold">Rata-rata Ukuran</p>
        <p className="text-2xl font-bold text-cyan-600 mt-2">{averageSize.toFixed(0)} sqft</p>
      </div>
    </div>
  );
}
