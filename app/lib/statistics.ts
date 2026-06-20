export interface Property {
  title: string;
  propertyName: string;
  bedroom: string;
  priceDaily?: number; // Optional daily rate
  priceMonthly: number;
  priceYearly: number;
  sizeSquft: number;
  furnitureStatus: string;
  url: string;
}

export function calculateStatistics(properties: Property[]) {
  if (properties.length === 0) {
    return {
      totalUnits: 0,
      averagePrice: 0,
      medianPrice: 0,
      modesPrice: [],
      fairPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      averageSize: 0,
      byBedroom: [],
    };
  }

  const prices = properties.map((p) => p.priceMonthly).sort((a, b) => a - b);
  const sizes = properties.map((p) => p.sizeSquft).filter((s) => s > 0);

  // Median
  const median =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

  // Average
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Min & Max
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Average Size
  const avgSize = sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;

  // Modus (harga yang paling sering muncul)
  const priceFrequency: Record<number, number> = {};
  prices.forEach((price) => {
    priceFrequency[price] = (priceFrequency[price] || 0) + 1;
  });

  const maxFrequency = Math.max(...Object.values(priceFrequency));
  const modesPrice = Object.entries(priceFrequency)
    .filter(([_, freq]) => freq === maxFrequency)
    .map(([price]) => parseInt(price, 10))
    .sort((a, b) => a - b);

  // Fair Price: representatif harga tengah (kombinasi median + average)
  // Formula: (Median + Average) / 2 untuk hasil yang lebih balanced
  const fairPrice = Math.round((median + average) / 2);

  // Group by bedroom
  const byBedroom = properties.reduce(
    (acc, prop) => {
      const existing = acc.find((item) => item.bedroom === prop.bedroom);
      if (existing) {
        existing.count += 1;
        existing.avgPrice =
          (existing.avgPrice * (existing.count - 1) + prop.priceMonthly) / existing.count;
      } else {
        acc.push({
          bedroom: prop.bedroom,
          count: 1,
          avgPrice: prop.priceMonthly,
        });
      }
      return acc;
    },
    [] as Array<{ bedroom: string; count: number; avgPrice: number }>
  );

  return {
    totalUnits: properties.length,
    averagePrice: Math.round(average),
    medianPrice: Math.round(median),
    modesPrice, // Array of most frequent prices
    fairPrice, // Representatif middle price
    minPrice: min,
    maxPrice: max,
    averageSize: Math.round(avgSize),
    byBedroom,
  };
}
