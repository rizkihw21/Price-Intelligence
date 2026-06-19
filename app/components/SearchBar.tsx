"use client";

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex gap-2 flex-col sm:flex-row bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex-1 flex items-center px-4">
          <span className="text-gray-400 text-2xl mr-3">🔍</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search area (e.g., Mont Kiara, Bangsar...)"
            className="w-full py-4 bg-transparent focus:outline-none text-lg text-sh-dark placeholder-gray-400"
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
    </form>
  );
}
