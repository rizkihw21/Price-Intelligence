"use client";

import { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import PriceSummaryCard from './components/PriceSummaryCard';
import PropertyTable from './components/PropertyTable';
import LoadingSkeleton from './components/LoadingSkeleton';
import PriceChart from './components/PriceChart';
import { calculateStatistics, Property } from './lib/statistics';
import { exportToCSV, exportToJSON, exportToExcel } from './lib/export';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // States for filters & sorting
  const [sortBy, setSortBy] = useState<string>('default');
  const [filterBedroom, setFilterBedroom] = useState<string>('all');
  const [filterFurnishing, setFilterFurnishing] = useState<string>('all');

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    setProperties([]);
    setStats(null);
    setError(null);
    // Reset filters on new search
    setSortBy('default');
    setFilterBedroom('all');
    setFilterFurnishing('all');

    try {
      const response = await axios.get(`/api/scrape?query=${encodeURIComponent(query)}`);
      const data = response.data.properties || [];
      setProperties(data);
      const calculatedStats = calculateStatistics(data);
      setStats(calculatedStats);
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 404) {
        setError(error.response.data);
      } else {
        setError({ error: 'Failed to fetch data', message: 'Please try again later.' });
      }
      setProperties([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic for presentation
  const displayedProperties = properties
    .filter((p) => {
      const matchBedroom = filterBedroom === 'all' || p.bedroom === filterBedroom;
      const matchFurnishing =
        filterFurnishing === 'all' ||
        p.furnitureStatus.toLowerCase().includes(filterFurnishing.toLowerCase());
      return matchBedroom && matchFurnishing;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceMonthly - b.priceMonthly;
      if (sortBy === 'price-desc') return b.priceMonthly - a.priceMonthly;
      return 0;
    });

  // Extract unique bedroom types for filter dropdown
  const bedroomTypes = Array.from(new Set(properties.map(p => p.bedroom))).sort();
  // Extract unique furnishing types for filter dropdown
  const furnishingTypes = ['Fully Furnished', 'Partially Furnished', 'Unfurnished'];

  return (
    <main className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-sh-dark flex items-center">
              SPEED<span className="text-[#E6B800] bg-sh-dark px-2.5 py-1 rounded-xl ml-1 text-white text-2xl font-black">HOME</span>
            </span>
          </div>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
            Price Intelligence App
          </span>
        </div>
      </header>

      <section className="bg-gradient-to-b from-white to-[#F7F7F7] py-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider mb-4">
            🚀 100% Automated Scraping
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-sh-dark tracking-tight leading-tight">
            Find the Fair Rent Price
          </h2>
          <p className="text-gray-500 text-lg md:text-xl mt-3 max-w-2xl mx-auto font-medium">
            Analyze property listings, average rates, and sizes from SPEEDHOME.com instantly.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        {loading && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="animate-spin text-2xl">⏳</span>
              <h3 className="text-xl font-bold text-sh-dark">Scraping data from SPEEDHOME...</h3>
            </div>
            <LoadingSkeleton />
          </section>
        )}

        {!loading && error && (
          <div className="bg-white p-12 rounded-2xl border border-red-100 text-center shadow-sm">
            <span className="text-5xl block mb-4">⚠️</span>
            <p className="text-red-600 text-lg font-bold">{error.error}</p>
            <p className="text-gray-500 text-sm mt-2">{error.message}</p>
            {error.availableCities && (
              <div className="mt-6">
                <p className="text-gray-600 font-semibold">Try these popular areas:</p>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  {error.availableCities.map((city: string) => (
                    <button
                      key={city}
                      onClick={() => handleSearch(city)}
                      className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:border-sh-yellow hover:text-sh-dark hover:bg-sh-yellow/10 transition duration-200"
                    >
                      📍 {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && properties.length > 0 && stats && (
          <>
            {/* Stats Cards */}
            <section className="space-y-4">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <h3 className="text-2xl font-bold text-sh-dark">
                  📈 Market Summary: <span className="text-[#E6B800]">{searchQuery}</span>
                </h3>
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToExcel(properties, stats, searchQuery)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 hover:shadow-md transition duration-200"
                  >
                    Download Excel
                  </button>
                  <button
                    onClick={() => exportToCSV(properties, searchQuery)}
                    className="px-5 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 hover:shadow-md transition duration-200"
                  >
                    Download CSV
                  </button>
                  <button
                    onClick={() => exportToJSON(properties, stats, searchQuery)}
                    className="px-5 py-2.5 bg-sh-dark text-white font-bold text-sm rounded-xl hover:bg-black hover:shadow-md transition duration-200"
                  >
                    Download JSON
                  </button>
                </div>
              </div>
              <PriceSummaryCard
                averagePrice={stats.averagePrice}
                medianPrice={stats.medianPrice}
                modesPrice={stats.modesPrice}
                fairPrice={stats.fairPrice}
                minPrice={stats.minPrice}
                maxPrice={stats.maxPrice}
                totalUnits={stats.totalUnits}
                averageSize={stats.averageSize}
                hasDaily={properties.some(p => p.priceDaily !== undefined)}
                hasMonthly={true}
                hasYearly={true}
              />
            </section>

            {/* Visualisation Chart */}
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-sh-dark">📊 Market Trends</h3>
              <PriceChart data={stats.byBedroom} />
            </section>

            {/* Property Table with Filters */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-sh-dark">📋 Unit Listings</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Showing {displayedProperties.length} of {properties.length} properties
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2">
                  {/* Sort Select */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 mb-1 uppercase">Sort By Price</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-sh-dark focus:outline-none focus:border-sh-yellow"
                    >
                      <option value="default">Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Bedroom Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 mb-1 uppercase">Room Type</label>
                    <select
                      value={filterBedroom}
                      onChange={(e) => setFilterBedroom(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-sh-dark focus:outline-none focus:border-sh-yellow"
                    >
                      <option value="all">All Rooms</option>
                      {bedroomTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Furnishing Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 mb-1 uppercase">Furnishing</label>
                    <select
                      value={filterFurnishing}
                      onChange={(e) => setFilterFurnishing(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-sh-dark focus:outline-none focus:border-sh-yellow"
                    >
                      <option value="all">All Furnishings</option>
                      {furnishingTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Listings Table */}
              <PropertyTable properties={displayedProperties} />
            </section>
          </>
        )}

        {!loading && properties.length === 0 && !searchQuery && !error && (
          <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center shadow-sm max-w-3xl mx-auto">
            <span className="text-5xl block mb-4">💡</span>
            <p className="text-sh-dark text-xl font-bold">Start Exploring Properties</p>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Type any Malaysian city or area name above to extract current rental prices and statistics.
            </p>
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {["Mont Kiara", "Bangsar", "Damansara"].map((area) => (
                <button
                  key={area}
                  onClick={() => handleSearch(area)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:border-sh-yellow hover:text-sh-dark hover:bg-sh-yellow/10 transition duration-200"
                >
                  📍 {area}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-sh-dark text-gray-400 text-center py-10 border-t border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
          <p className="text-xl font-extrabold text-white">
            SPEED<span className="text-sh-yellow">HOME</span> Price Intelligence
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            This dashboard is an assessment project created for Jendela360. All property listing data is fetched dynamically from SPEEDHOME.com.
          </p>
          <div className="pt-4 border-t border-gray-800 text-xs text-gray-600">
            © 2026 SPEEDHOME Price Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
