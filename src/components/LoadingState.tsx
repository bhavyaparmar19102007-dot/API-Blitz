import React from 'react';

interface Props { count?: number; }

export default function LoadingState({ count = 8 }: Props) {
  return (
    <div className="grid-cards">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 0 }}>
          <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '0.875rem', width: '80%' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
