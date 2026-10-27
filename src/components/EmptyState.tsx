import React from 'react';
import { SearchX } from 'lucide-react';

interface Props { message?: string; }

export default function EmptyState({ message = 'No results found. Try a different search or filter.' }: Props) {
  return (
    <div className="empty-state">
      <div className="icon"><SearchX size={40} /></div>
      <h3>Nothing here</h3>
      <p>{message}</p>
    </div>
  );
}
