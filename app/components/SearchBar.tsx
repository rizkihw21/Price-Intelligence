"use client";

import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

// Autocomplete Suggestions - Area & Apartemen populer di Malaysia
const SEARCH_SUGGESTIONS = [
  // Kuala Lumpur & sekitarnya
  { value: 'Kuala Lumpur', label: 'Kuala Lumpur (City)' },
  { value: 'KLCC', label: 'KLCC (Premium Area)' },
  { value: 'Cheras', label: 'Cheras (Area)' },
  { value: 'Ampang', label: 'Ampang (Area)' },
  { value: 'Setapak', label: 'Setapak (Area)' },
  { value: 'Sentul', label: 'Sentul (Area)' },

  // Mont Kiara & Condos
  { value: 'Mont Kiara', label: 'Mont Kiara (Area)' },
  { value: 'Residensi 22, Mont Kiara', label: 'Residensi 22, Mont Kiara (Condo)' },
  { value: 'Seni Mont Kiara', label: 'Seni Mont Kiara (Condo)' },
  { value: '10 Mont Kiara', label: '10 Mont Kiara (Condo)' },
  { value: 'Gateway Kiaramas', label: 'Gateway Kiaramas (Condo)' },
  { value: 'Mont Kiara Pines', label: 'Mont Kiara Pines (Condo)' },
  { value: 'Arcoris Mont Kiara', label: 'Arcoris Mont Kiara (Condo)' },
  { value: 'Pavilion Hilltop', label: 'Pavilion Hilltop (Condo)' },
  { value: 'Verve Suites', label: 'Verve Suites (Condo)' },

  // Bangsar & Condos
  { value: 'Bangsar', label: 'Bangsar (Area)' },
  { value: 'Nadi Bangsar', label: 'Nadi Bangsar (Condo)' },
  { value: 'Bangsar Peak', label: 'Bangsar Peak (Condo)' },
  { value: 'Tivoli Villas', label: 'Tivoli Villas (Condo)' },
  { value: 'Suasana Bangsar', label: 'Suasana Bangsar (Condo)' },
  { value: 'Gaya Bangsar', label: 'Gaya Bangsar (Condo)' },

  // Damansara & Condos
  { value: 'Damansara', label: 'Damansara (Area)' },
  { value: 'Uptown Residences', label: 'Uptown Residences (Condo)' },
  { value: 'Glomac Damansara', label: 'Glomac Damansara (Condo)' },
  { value: 'The Tropics', label: 'The Tropics (Condo)' },
  { value: 'Damansara Intan', label: 'Damansara Intan (Condo)' },

  // Selangor (Petaling Jaya, Subang Jaya, dll)
  { value: 'Petaling Jaya', label: 'Petaling Jaya (City)' },
  { value: 'Subang Jaya', label: 'Subang Jaya (City)' },
  { value: 'Puchong', label: 'Puchong (Area)' },
  { value: 'Shah Alam', label: 'Shah Alam (City)' },
  { value: 'Cyberjaya', label: 'Cyberjaya (City)' },

  // Johor
  { value: 'Johor Bahru', label: 'Johor Bahru (City)' },

  // Penang
  { value: 'Penang', label: 'Penang (City)' },
  { value: 'Georgetown', label: 'Georgetown, Penang (City)' },
];

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_SUGGESTIONS>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let query = input.trim();
    if (!query) return;

    // Autodetect SPEEDHOME URL (e.g. https://speedhome.com/rent/mont-kiara)
    const speedhomeUrlPattern = /speedhome\.com\/rent\/([a-zA-Z0-9-]+)/i;
    const urlMatch = query.match(speedhomeUrlPattern);
    if (urlMatch) {
      const slug = urlMatch[1];
      // Ubah slug jadi title case (mont-kiara -> Mont Kiara)
      query = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    onSearch(query);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (value: string) => {
    setInput(value);
    onSearch(value);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Hide dropdown if input is a URL
    if (value.match(/speedhome\.com/i)) {
      setShowDropdown(false);
      return;
    }

    if (value.length >= 2) {
      const filtered = SEARCH_SUGGESTIONS.filter(
        (s) =>
          s.value.toLowerCase().includes(value.toLowerCase()) ||
          s.label.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Tampilkan max 8 saran
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mt-8 relative" ref={dropdownRef}>
      <div className="flex gap-2 flex-col sm:flex-row bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex-1 flex items-center px-4">
          <span className="text-gray-400 text-2xl mr-3">🔍</span>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Search area or paste SPEEDHOME URL..."
            className="w-full py-4 bg-transparent focus:outline-none text-lg text-sh-dark placeholder-gray-400"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-4 bg-sh-yellow text-sh-dark rounded-xl hover:bg-yellow-400 disabled:opacity-50 font-bold text-lg transition duration-200"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Dropdown Autocomplete */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs font-bold text-gray-400 uppercase px-3 py-2">Suggested Searches</p>
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(s.value)}
                className="px-4 py-3 hover:bg-sh-yellow/10 cursor-pointer flex items-center gap-2 transition duration-150"
              >
                <span className="text-sh-yellow">📍</span>
                <span className="text-sh-dark font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
