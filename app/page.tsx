"use client";

import { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import PriceSummaryCard from './components/PriceSummaryCard';
import PropertyTable from './components/PropertyTable';
import LoadingSkeleton from './components/LoadingSkeleton';
import { calculateStatistics, Property } from './lib/statistics';
import { exportToCSV, exportToJSON } from './lib/export';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    try {
      const response = await axios.get(`/api/scrape?query=${encodeURIComponent(query)}`);
      const data = response.data.properties || [];
      setProperties(data);
      const calculatedStats = calculateStatistics(data);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mengambil data. Cek console untuk detail error.');
      setProperties([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            🏠 SPEEDHOME Price Intelligence
          </h1>
          <p className="text-gray-600 mt-1">
            Analisis harga sewa properti dari SPEEDHOME.com secara real-time
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⏳ Mengambil data...</h2>
            <LoadingSkeleton />
          </section>
        )}

        {/* Results Section */}
        {!loading && properties.length > 0 && stats && (
          <>
            {/* Statistics Cards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📊 Ringkasan Harga - {searchQuery}
              </h2>
              <PriceSummaryCard
                averagePrice={stats.averagePrice}
                medianPrice={stats.medianPrice}
                minPrice={stats.minPrice}
                maxPrice={stats.maxPrice}
                totalUnits={stats.totalUnits}
                averageSize={stats.averageSize}
              />
            </section>

            {/* Export Buttons */}
            <section className="flex gap-3 flex-wrap">
              <button
                onClick={() => exportToCSV(properties, searchQuery)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                📥 Download CSV
              </button>
              <button
                onClick={() => exportToJSON(properties, stats, searchQuery)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                📥 Download JSON
              </button>
            </section>

            {/* Property Table */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📋 Daftar Unit ({properties.length} properti)
              </h2>
              <PropertyTable properties={properties} />
            </section>
          </>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && searchQuery && (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-gray-500 text-lg">
              Belum ada hasil. Coba area lain atau cek koneksi.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && properties.length === 0 && !searchQuery && (
          <div className="bg-white p-12 rounded-lg text-center">
            <p className="text-gray-500 text-lg mb-4">
              👆 Mulai dengan memasukkan nama area atau apartemen di atas
            </p>
            <p className="text-gray-400">
              Contoh: Mont Kiara, Bangsar, Damansara, Sentosa
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
        <p>Data diambil dari SPEEDHOME.com | © 2026</p>
      </footer>
    </main>
  );
}
