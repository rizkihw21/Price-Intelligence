"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/scrape?query=${encodeURIComponent(searchInput)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal mengambil data, coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🏠 SPEEDHOME Price Intelligence
        </h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            className="flex-1 p-3 border rounded-lg shadow-sm"
            placeholder="Ketik nama area/apartemen (misal: Mont Kiara)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Mencari...' : 'Cari Data'}
          </button>
        </div>

        {results && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Hasil untuk: {searchInput}</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
