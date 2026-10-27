import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink } from 'lucide-react';
import type { FavoriteItem } from '../types';
import EmptyState from '../components/EmptyState';
import ImageWithFallback from '../components/ImageWithFallback';

interface Props {
  favorites: FavoriteItem[];
  removeFavorite: (id: string, source: FavoriteItem['source']) => void;
  addToast: (msg: string) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  anilist: 'Anime',
  pokemon: 'Pokémon',
  rickandmorty: 'Rick & Morty',
  potter: 'Harry Potter',
  ghibli: 'Studio Ghibli',
};

const SOURCE_ROUTES: Record<string, string> = {
  anilist: '/anime',
  pokemon: '/pokemon',
  rickandmorty: '/rickandmorty',
  potter: '/potter',
  ghibli: '/ghibli',
};

export default function FavoritesPage({ favorites, removeFavorite, addToast }: Props) {
  const navigate = useNavigate();

  const handleRemove = (item: FavoriteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(item.id, item.source);
    addToast(`Removed "${item.title}" from favorites`);
  };

  const handleOpen = (item: FavoriteItem) => {
    const route = SOURCE_ROUTES[item.source];
    if (route) {
      navigate(`${route}?detail=${item.id}`);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>❤️ Saved Favorites</h1>
        <p>Your curated items from across all universes ({favorites.length})</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState message="You haven't added any favorites yet! Explore the universes and click the heart icon on any card to save it here." />
      ) : (
        <div className="grid-cards">
          {favorites.map(item => (
            <div
              key={`${item.source}-${item.id}`}
              className="media-card"
              onClick={() => handleOpen(item)}
            >
              <button
                className="fav-btn faved"
                onClick={e => handleRemove(item, e)}
                aria-label="Remove favorite"
                title="Remove favorite"
              >
                <Trash2 size={16} />
              </button>

              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className="media-card-img"
              />

              <div className="media-card-body">
                <span className="badge" style={{ marginBottom: '0.375rem' }}>
                  {SOURCE_LABELS[item.source] || item.source}
                </span>
                <div className="media-card-title">{item.title}</div>
                {item.subtitle && <div className="media-card-sub">{item.subtitle}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
