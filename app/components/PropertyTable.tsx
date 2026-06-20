"use client";

import { useState } from 'react';

interface Property {
  title: string;
  propertyName: string;
  bedroom: string;
  priceDaily?: number;
  priceMonthly: number;
  priceYearly: number;
  sizeSquft: number;
  furnitureStatus: string;
  url: string;
}

export default function PropertyTable({ properties }: { properties: Property[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(price);

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProperties = properties.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman 1
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Per-page Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-sh-dark focus:outline-none focus:border-sh-yellow"
          >
            <option value="8">8</option>
            <option value="16">16</option>
            <option value="32">32</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Showing {startIndex + 1}-{Math.min(endIndex, properties.length)} of {properties.length} properties
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-5">Property Details</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Size</th>
                <th className="px-6 py-5">Furnishing</th>
                <th className="px-6 py-5 text-right">Price</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedProperties.map((prop, idx) => (
                <tr key={idx} className="hover:bg-yellow-50/50 transition duration-150">
                  <td className="px-6 py-5">
                    <p className="font-bold text-sh-dark text-base mb-1">{prop.title}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <span className="text-sh-yellow">📍</span> {prop.propertyName}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-sh-dark">
                      {prop.bedroom}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-600 font-medium">
                    {prop.sizeSquft} sqft
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      prop.furnitureStatus.includes('Fully')
                        ? 'bg-sh-yellow/20 text-sh-dark'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {prop.furnitureStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {prop.priceDaily && (
                      <p className="text-xs text-gray-400 font-medium">{formatPrice(prop.priceDaily)}/day</p>
                    )}
                    <p className="font-bold text-sh-dark text-lg">{formatPrice(prop.priceMonthly)}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                    <p className="text-xs text-gray-400 font-medium">{formatPrice(prop.priceYearly)}/yr</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <a
                      href={prop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2.5 bg-sh-yellow text-sh-dark font-bold text-sm rounded-xl hover:bg-yellow-400 hover:shadow-md transition"
                    >
                      View Unit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-sh-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentPage === page
                  ? 'bg-sh-yellow text-sh-dark'
                  : 'border border-gray-200 text-sh-dark hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-sh-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
