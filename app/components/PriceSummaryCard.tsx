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
  averagePrice, medianPrice, minPrice, maxPrice, totalUnits, averageSize,
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Total Units Found" value={totalUnits} subtitle="Active Listings Scraped" />
      <Card title="Average Price" value={formatPrice(averagePrice)} subtitle="Per Month Estimate" />
      <Card title="Median Price" value={formatPrice(medianPrice)} subtitle="Per Month Estimate" />
      <Card title="Lowest Price" value={formatPrice(minPrice)} subtitle="Starting From" />
      <Card title="Highest Price" value={formatPrice(maxPrice)} subtitle="Up To" />
      <Card title="Average Size" value={`${averageSize.toFixed(0)} sqft`} subtitle="Estimated Area" />
    </div>
  );
}
