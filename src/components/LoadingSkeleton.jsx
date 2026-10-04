import React from 'react';

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="skeleton-table-wrapper">
      <div className="skeleton-table-header">
        <div className="skeleton-line w-1/4" />
        <div className="skeleton-line w-1/6" />
        <div className="skeleton-line w-1/6" />
        <div className="skeleton-line w-1/6" />
        <div className="skeleton-line w-1/6" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-table-row">
          <div className="flex items-center gap-3 w-1/3">
            <div className="skeleton-avatar" />
            <div className="skeleton-line w-3/4" />
          </div>
          <div className="skeleton-line w-16" />
          <div className="skeleton-line w-20" />
          <div className="skeleton-line w-24" />
          <div className="skeleton-line w-28" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card skeleton-card">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-2/3">
          <div className="skeleton-line w-1/2" />
          <div className="skeleton-line h-8 w-3/4" />
        </div>
        <div className="skeleton-avatar w-10 h-10" />
      </div>
      <div className="skeleton-line w-1/3 mt-4" />
    </div>
  );
}
