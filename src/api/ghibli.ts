import type { GhibliFilm } from '../types';

const ENDPOINTS = [
  'https://ghibliapi.vercel.app/films',
  'https://ghibli.rest/films',
  'https://ghibliapi.dev/films',
];

let workingEndpoint: string | null = null;

export async function fetchGhibliFilms(signal?: AbortSignal): Promise<GhibliFilm[]> {
  if (workingEndpoint) {
    const res = await fetch(workingEndpoint, { signal });
    if (res.ok) return res.json();
  }

  const errors: string[] = [];
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { signal });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          workingEndpoint = endpoint;
          return data as GhibliFilm[];
        }
      }
      errors.push(`${endpoint}: HTTP ${res.status}`);
    } catch (err: any) {
      errors.push(`${endpoint}: ${err.message}`);
    }
  }
  throw new Error(`All Ghibli endpoints failed: ${errors.join('; ')}`);
}

export async function fetchGhibliFilmById(id: string, signal?: AbortSignal): Promise<GhibliFilm | null> {
  const films = await fetchGhibliFilms(signal);
  return films.find(f => f.id === id) ?? null;
}

export async function searchGhibliForGlobal(search: string, signal?: AbortSignal): Promise<GhibliFilm[]> {
  const films = await fetchGhibliFilms(signal);
  const q = search.toLowerCase();
  return films.filter(f => f.title.toLowerCase().includes(q) || f.original_title?.toLowerCase().includes(q)).slice(0, 5);
}
