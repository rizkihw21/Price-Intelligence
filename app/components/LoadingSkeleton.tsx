"use client";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Price Summary Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 p-6 rounded-lg h-32" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}
