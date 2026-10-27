import { useState, useEffect, useCallback } from 'react';
import type { FavoriteItem } from '../types';

const STORAGE_KEY = 'multiverse-favorites';

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((id: string, source: FavoriteItem['source']) => {
    return favorites.some(f => f.id === id && f.source === source);
  }, [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id && f.source === item.source);
      if (exists) return prev.filter(f => !(f.id === item.id && f.source === item.source));
      return [...prev, item];
    });
    return !favorites.some(f => f.id === item.id && f.source === item.source);
  }, [favorites]);

  const removeFavorite = useCallback((id: string, source: FavoriteItem['source']) => {
    setFavorites(prev => prev.filter(f => !(f.id === id && f.source === source)));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, count: favorites.length };
}
