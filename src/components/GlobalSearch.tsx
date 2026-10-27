import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchAnimeForGlobal } from '../api/anilist';
import { searchPokemonForGlobal } from '../api/pokeapi';
import { searchCharactersForGlobal } from '../api/rickAndMorty';
import { searchPotterForGlobal } from '../api/potterdb';
import { searchGhibliForGlobal } from '../api/ghibli';
import ImageWithFallback from './ImageWithFallback';
import type { AniListMedia, PokemonDetail, RickMortyCharacter, PotterCharacter, GhibliFilm } from '../types';
import { getPokemonImage } from '../api/pokeapi';

interface SearchResult {
  id: string;
  name: string;
  image: string;
  source: string;
  route: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults({}); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const grouped: Record<string, SearchResult[]> = {};
    const promises: Promise<void>[] = [];

    promises.push(
      searchAnimeForGlobal(q, controller.signal)
        .then((items: AniListMedia[]) => { if (items.length) grouped['Anime'] = items.map(a => ({ id: String(a.id), name: a.title.romaji || a.title.english || '', image: a.coverImage.medium, source: 'Anime', route: `/anime?detail=${a.id}` })); })
        .catch(() => {})
    );
    promises.push(
      searchPokemonForGlobal(q, controller.signal)
        .then((items: PokemonDetail[]) => { if (items.length) grouped['Pokémon'] = items.map(p => ({ id: String(p.id), name: p.name, image: getPokemonImage(p), source: 'Pokémon', route: `/pokemon?detail=${p.id}` })); })
        .catch(() => {})
    );
    promises.push(
      searchCharactersForGlobal(q, controller.signal)
        .then((items: RickMortyCharacter[]) => { if (items.length) grouped['Rick & Morty'] = items.map(c => ({ id: String(c.id), name: c.name, image: c.image, source: 'Rick & Morty', route: `/rickandmorty?detail=${c.id}` })); })
        .catch(() => {})
    );
    promises.push(
      searchPotterForGlobal(q, controller.signal)
        .then((items: PotterCharacter[]) => { if (items.length) grouped['Harry Potter'] = items.map(c => ({ id: c.id, name: c.attributes.name, image: c.attributes.image || '', source: 'Harry Potter', route: `/potter?detail=${c.id}` })); })
        .catch(() => {})
    );
    promises.push(
      searchGhibliForGlobal(q, controller.signal)
        .then((items: GhibliFilm[]) => { if (items.length) grouped['Ghibli'] = items.map(f => ({ id: f.id, name: f.title, image: f.image || '', source: 'Ghibli', route: `/ghibli?detail=${f.id}` })); })
        .catch(() => {})
    );

    await Promise.allSettled(promises);
    if (!controller.signal.aborted) {
      setResults(grouped);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const hasResults = Object.keys(results).length > 0;

  return (
    <>
      <div className="global-search-overlay" onClick={onClose} />
      <div className="global-search-panel">
        <div className="global-search-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="input"
              placeholder="Search across all universes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search across all universes"
            />
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close search">
              <X size={20} />
            </button>
          </div>

          {loading && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Searching...</p>}

          {!loading && query.length >= 2 && !hasResults && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
              No results found for "{query}"
            </p>
          )}

          {hasResults && Object.entries(results).map(([group, items]) => (
            <div key={group} className="search-group">
              <h3>{group}</h3>
              {items.map(item => (
                <div
                  key={`${item.source}-${item.id}`}
                  className="search-result-item"
                  onClick={() => { navigate(item.route); onClose(); }}
                >
                  <ImageWithFallback src={item.image} alt={item.name} />
                  <div>
                    <div className="name">{item.name}</div>
                    <div className="source">{item.source}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
