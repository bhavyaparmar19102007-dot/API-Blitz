import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props { message: string; onRetry?: () => void; }

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="error-state">
      <div className="icon"><AlertTriangle size={40} style={{ color: 'var(--danger)' }} /></div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
