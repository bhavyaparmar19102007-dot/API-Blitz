// ── Shared types ──────────────────────────────────────────

export interface FavoriteItem {
  id: string;
  source: 'anilist' | 'pokemon' | 'rickandmorty' | 'potter' | 'ghibli';
  title: string;
  image: string;
  subtitle?: string;
}

// ── AniList ───────────────────────────────────────────────

export interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string | null };
  coverImage: { large: string; medium: string };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  format: string | null;
  status: string | null;
  seasonYear: number | null;
  season: string | null;
  studios: { nodes: { name: string }[] };
}

export interface AniListPage {
  pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean; perPage: number };
  media: AniListMedia[];
}

// ── PokéAPI ───────────────────────────────────────────────

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': { front_default: string | null };
      dream_world: { front_default: string | null };
    };
  };
}

// ── Rick and Morty ────────────────────────────────────────

export interface RickMortyCharacter {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface RickMortyPage {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: RickMortyCharacter[];
}

// ── PotterDB ──────────────────────────────────────────────

export interface PotterCharacter {
  id: string;
  type: string;
  attributes: {
    slug: string;
    name: string;
    born: string | null;
    died: string | null;
    gender: string | null;
    species: string | null;
    house: string | null;
    image: string | null;
    wiki: string | null;
    [key: string]: any;
  };
}

export interface PotterBook {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title: string;
    author: string;
    cover: string | null;
    summary: string | null;
    release_date: string | null;
    pages: number | null;
    dedication: string | null;
    wiki: string | null;
    [key: string]: any;
  };
}

export interface PotterMovie {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title: string;
    poster: string | null;
    summary: string | null;
    release_date: string | null;
    directors: string[] | null;
    rating: string | null;
    running_time: string | null;
    budget: string | null;
    box_office: string | null;
    wiki: string | null;
    [key: string]: any;
  };
}

export interface PotterSpell {
  id: string;
  type: string;
  attributes: {
    slug: string;
    name: string;
    incantation: string | null;
    category: string | null;
    effect: string | null;
    light: string | null;
    hand: string | null;
    image: string | null;
    wiki: string | null;
    [key: string]: any;
  };
}

export interface PotterApiResponse<T> {
  data: T[];
  meta: { pagination: { current: number; last: number; records: number; next?: number; previous?: number } };
  links: { self: string; current: string; next?: string; last?: string; first?: string };
}

// ── Studio Ghibli ─────────────────────────────────────────

export interface GhibliFilm {
  id: string;
  title: string;
  original_title: string;
  original_title_romanised: string;
  image: string;
  movie_banner: string;
  description: string;
  director: string;
  producer: string;
  release_date: string;
  running_time: string;
  rt_score: string;
  url: string;
}
