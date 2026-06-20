"use client";

interface PriceSummaryProps {
  averagePrice: number;
  medianPrice: number;
  modesPrice: number[];
  fairPrice: number;
  minPrice: number;
  maxPrice: number;
  totalUnits: number;
  averageSize: number;
  hasDaily?: boolean;
  hasMonthly?: boolean;
  hasYearly?: boolean;
}

export default function PriceSummaryCard({
  averagePrice, medianPrice, modesPrice, fairPrice, minPrice, maxPrice, totalUnits, averageSize,
  hasDaily = false, hasMonthly = true, hasYearly = true,
}: PriceSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency', currency: 'MYR', maximumFractionDigits: 0
    }).format(price);
  };

  const Card = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <div className="bg-white p-6 rounded-2xl border-t-4 border-sh-yellow shadow-sm hover:shadow-md transition duration-200">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-sh-dark mt-2">{value}</p>
      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  // Format modus prices (most frequent prices)
  const modesDisplay = modesPrice.length > 0
    ? modesPrice.length === 1
      ? formatPrice(modesPrice[0])
      : `${modesPrice.map(p => formatPrice(p)).join(', ')} (${modesPrice.length} values)`
    : 'N/A';

  // Check availability of rental types
  const rentalTypes = [
    { type: 'Daily', available: hasDaily || false, note: hasDaily ? 'Available' : 'Not Available' },
    { type: 'Monthly', available: hasMonthly !== false, note: 'Available' },
    { type: 'Yearly', available: hasYearly !== false, note: 'Available' }
  ];

  return (
    <div className="space-y-6">
      {/* Rental Type Availability Banner */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <span className="font-bold text-sh-dark">Rental Type Availability:</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {rentalTypes.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${t.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-semibold text-sh-dark">{t.type}:</span>
              <span className="text-xs text-gray-500 font-medium">{t.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Units Found" value={totalUnits} subtitle="Active Listings Scraped" />
        <Card title="Average Price" value={formatPrice(averagePrice)} subtitle="Per Month" />
        <Card title="Median Price" value={formatPrice(medianPrice)} subtitle="Per Month" />
        <Card title="Most Common Price" value={modesDisplay} subtitle="Mode (Most Frequent)" />
        <Card title="Fair Price" value={formatPrice(fairPrice)} subtitle="Recommended Baseline" />
        <Card title="Price Range" value={`${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`} subtitle="Min to Max" />
        <Card title="Average Size" value={`${averageSize.toFixed(0)} sqft`} subtitle="Average Area" />
      </div>
    </div>
  );
}
