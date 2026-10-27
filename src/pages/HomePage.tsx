import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Swords, Ghost, BookOpen, Film } from 'lucide-react';
import { fetchAnime } from '../api/anilist';
import { fetchCharacters } from '../api/rickAndMorty';
import ImageWithFallback from '../components/ImageWithFallback';
import type { AniListMedia, RickMortyCharacter } from '../types';

const universes = [
  { to: '/anime', icon: '🎌', title: 'Anime', desc: 'Discover anime with AniList', color: '#3b82f6' },
  { to: '/pokemon', icon: '⚡', title: 'Pokémon', desc: 'Explore the Pokédex', color: '#eab308' },
  { to: '/rickandmorty', icon: '🛸', title: 'Rick & Morty', desc: 'Characters across dimensions', color: '#22c55e' },
  { to: '/potter', icon: '⚡', title: 'Harry Potter', desc: 'Wizarding World lore', color: '#a855f7' },
  { to: '/ghibli', icon: '🌿', title: 'Studio Ghibli', desc: 'Animated movie magic', color: '#06b6d4' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [trendingAnime, setTrendingAnime] = useState<AniListMedia[]>([]);
  const [trendingRM, setTrendingRM] = useState<RickMortyCharacter[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAnime({ sort: 'TRENDING_DESC', page: 1, perPage: 10 }, ctrl.signal)
      .then(p => setTrendingAnime(p.media))
      .catch(() => {});
    fetchCharacters({ page: 1 }, ctrl.signal)
      .then(p => setTrendingRM(p.results.slice(0, 10)))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1>
          Multiverse <span className="accent">Explorer</span>
        </h1>
        <p className="tagline">Five Universes. One Explorer.</p>
        <button className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }} onClick={() => {
          document.getElementById('universes')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          Explore Now
        </button>
      </section>

      <div className="container">
        {/* Universe Cards */}
        <section id="universes" style={{ paddingBottom: '2rem' }}>
          <div className="universe-grid">
            {universes.map(u => (
              <div key={u.to} className="universe-card" onClick={() => navigate(u.to)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate(u.to)}>
                <div className="icon">{u.icon}</div>
                <h3>{u.title}</h3>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Anime */}
        {trendingAnime.length > 0 && (
          <section className="trending-section">
            <h2>🔥 Trending Anime</h2>
            <div className="trending-scroll">
              {trendingAnime.map(a => (
                <div key={a.id} className="trending-card" onClick={() => navigate(`/anime?detail=${a.id}`)}>
                  <ImageWithFallback src={a.coverImage.large} alt={a.title.romaji} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
                  <div className="info">
                    <h4>{a.title.romaji || a.title.english}</h4>
                    <p>{a.genres?.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Rick & Morty */}
        {trendingRM.length > 0 && (
          <section className="trending-section">
            <h2>🛸 Popular Characters</h2>
            <div className="trending-scroll">
              {trendingRM.map(c => (
                <div key={c.id} className="trending-card" onClick={() => navigate(`/rickandmorty?detail=${c.id}`)}>
                  <ImageWithFallback src={c.image} alt={c.name} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
                  <div className="info">
                    <h4>{c.name}</h4>
                    <p>{c.status} · {c.species}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
