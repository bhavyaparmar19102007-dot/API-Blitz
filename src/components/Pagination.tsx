import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, disabled }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button disabled={currentPage <= 1 || disabled} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>…</span>
        ) : (
          <button
            key={p}
            className={p === currentPage ? 'active' : ''}
            onClick={() => onPageChange(p as number)}
            disabled={disabled}
          >
            {p}
          </button>
        )
      )}
      <button disabled={currentPage >= totalPages || disabled} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
