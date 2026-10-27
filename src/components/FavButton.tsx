import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  isFav: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function FavButton({ isFav, onClick }: Props) {
  return (
    <button
      className={`fav-btn ${isFav ? 'faved' : ''}`}
      onClick={onClick}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}
