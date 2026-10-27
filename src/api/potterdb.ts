import type { PotterApiResponse, PotterCharacter, PotterBook, PotterMovie, PotterSpell } from '../types';

const BASE = 'https://api.potterdb.com/v1';

async function potterFetch<T>(path: string, params?: Record<string, string>, signal?: AbortSignal): Promise<PotterApiResponse<T>> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`PotterDB HTTP ${res.status}`);
  return res.json();
}

export async function fetchPotterCharacters(page = 1, search?: string, signal?: AbortSignal): Promise<PotterApiResponse<PotterCharacter>> {
  const params: Record<string, string> = { 'page[number]': String(page), 'page[size]': '20' };
  if (search) params['filter[name_cont]'] = search;
  return potterFetch<PotterCharacter>('/characters', params, signal);
}

export async function fetchPotterBooks(signal?: AbortSignal): Promise<PotterApiResponse<PotterBook>> {
  return potterFetch<PotterBook>('/books', undefined, signal);
}

export async function fetchPotterMovies(signal?: AbortSignal): Promise<PotterApiResponse<PotterMovie>> {
  return potterFetch<PotterMovie>('/movies', undefined, signal);
}

export async function fetchPotterSpells(page = 1, search?: string, signal?: AbortSignal): Promise<PotterApiResponse<PotterSpell>> {
  const params: Record<string, string> = { 'page[number]': String(page), 'page[size]': '20' };
  if (search) params['filter[name_cont]'] = search;
  return potterFetch<PotterSpell>('/spells', params, signal);
}

export async function searchPotterForGlobal(search: string, signal?: AbortSignal): Promise<PotterCharacter[]> {
  const res = await fetchPotterCharacters(1, search, signal);
  return res.data.slice(0, 5);
}
