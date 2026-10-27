import type { RickMortyCharacter, RickMortyPage } from '../types';

const BASE = 'https://rickandmortyapi.com/api';

export interface RickMortyFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  page?: number;
}

export async function fetchCharacters(filters: RickMortyFilters, signal?: AbortSignal): Promise<RickMortyPage> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.name) params.set('name', filters.name);
  if (filters.status) params.set('status', filters.status);
  if (filters.species) params.set('species', filters.species);
  if (filters.gender) params.set('gender', filters.gender);

  const url = `${BASE}/character?${params.toString()}`;
  const res = await fetch(url, { signal });

  if (res.status === 404) {
    return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
  }
  if (!res.ok) throw new Error(`Rick & Morty API HTTP ${res.status}`);
  return res.json();
}

export async function fetchCharacterById(id: number, signal?: AbortSignal): Promise<RickMortyCharacter> {
  const res = await fetch(`${BASE}/character/${id}`, { signal });
  if (!res.ok) throw new Error(`Rick & Morty API HTTP ${res.status}`);
  return res.json();
}

export async function fetchEpisodeName(url: string, signal?: AbortSignal): Promise<string> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return 'Unknown Episode';
    const data = await res.json();
    return `${data.episode}: ${data.name}`;
  } catch {
    return 'Unknown Episode';
  }
}

export const RM_STATUSES = ['Alive', 'Dead', 'unknown'];
export const RM_GENDERS = ['Female', 'Male', 'Genderless', 'unknown'];

export async function searchCharactersForGlobal(search: string, signal?: AbortSignal): Promise<RickMortyCharacter[]> {
  const page = await fetchCharacters({ name: search, page: 1 }, signal);
  return page.results.slice(0, 5);
}
