import type { PokemonDetail, PokemonListItem } from '../types';

const PRIMARY_BASE = 'https://pokeapi.co/api/v2';
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/api-data@master/data/api/v2';

const detailCache = new Map<string, PokemonDetail>();
let pokemonNameMap: Map<string, number> | null = null;
let allPokemonList: PokemonListItem[] | null = null;

async function tryFetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(`Endpoint returned HTML (likely firewall block) for ${url}`);
  }
  return res.json();
}

async function getFullList(signal?: AbortSignal): Promise<PokemonListItem[]> {
  if (allPokemonList) return allPokemonList;
  try {
    const data = await tryFetchJson<{ results: PokemonListItem[]; count: number }>(
      `${PRIMARY_BASE}/pokemon?limit=1025`,
      signal
    );
    allPokemonList = data.results;
    return allPokemonList;
  } catch {
    const data = await tryFetchJson<{ results: PokemonListItem[]; count: number }>(
      `${JSDELIVR_BASE}/pokemon/index.json`,
      signal
    );
    allPokemonList = data.results;
    return allPokemonList;
  }
}

export async function fetchPokemonList(
  offset = 0,
  limit = 20,
  signal?: AbortSignal
): Promise<{ results: PokemonListItem[]; count: number }> {
  try {
    const data = await tryFetchJson<{ results: PokemonListItem[]; count: number }>(
      `${PRIMARY_BASE}/pokemon?offset=${offset}&limit=${limit}`,
      signal
    );
    return data;
  } catch {
    const list = await getFullList(signal);
    return {
      results: list.slice(offset, offset + limit),
      count: list.length,
    };
  }
}

export async function fetchPokemonDetail(
  nameOrId: string | number,
  signal?: AbortSignal
): Promise<PokemonDetail> {
  const key = String(nameOrId).toLowerCase().trim();
  if (detailCache.has(key)) return detailCache.get(key)!;

  try {
    const data = await tryFetchJson<PokemonDetail>(`${PRIMARY_BASE}/pokemon/${key}`, signal);
    detailCache.set(key, data);
    detailCache.set(String(data.id), data);
    detailCache.set(data.name.toLowerCase(), data);
    return data;
  } catch {
    let numericId: number;
    if (/^\d+$/.test(key)) {
      numericId = parseInt(key, 10);
    } else {
      if (!pokemonNameMap) {
        const list = await getFullList(signal);
        pokemonNameMap = new Map();
        list.forEach((p, idx) => {
          const match = p.url.match(/\/(\d+)\/?$/);
          const id = match ? parseInt(match[1], 10) : idx + 1;
          pokemonNameMap!.set(p.name.toLowerCase(), id);
        });
      }
      numericId = pokemonNameMap.get(key) || 0;
      if (!numericId) throw new Error(`Pokemon "${key}" not found`);
    }

    const data = await tryFetchJson<PokemonDetail>(
      `${JSDELIVR_BASE}/pokemon/${numericId}/index.json`,
      signal
    );
    detailCache.set(key, data);
    detailCache.set(String(data.id), data);
    detailCache.set(data.name.toLowerCase(), data);
    return data;
  }
}

export async function fetchPokemonBatch(
  items: PokemonListItem[],
  signal?: AbortSignal
): Promise<PokemonDetail[]> {
  const batchSize = 10;
  const results: PokemonDetail[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const fetched = await Promise.all(
      batch.map(item => {
        const idMatch = item.url.match(/\/(\d+)\/?$/);
        const id = idMatch ? idMatch[1] : item.name;
        return fetchPokemonDetail(id, signal);
      })
    );
    results.push(...fetched);
  }
  return results;
}

export function getPokemonImage(pokemon: PokemonDetail): string {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ??
    pokemon.sprites?.other?.dream_world?.front_default ??
    pokemon.sprites?.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
  );
}

export const POKEMON_TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

export async function searchPokemonByName(name: string, signal?: AbortSignal): Promise<PokemonDetail | null> {
  try {
    return await fetchPokemonDetail(name.toLowerCase().trim(), signal);
  } catch {
    return null;
  }
}

export async function searchPokemonForGlobal(search: string, signal?: AbortSignal): Promise<PokemonDetail[]> {
  const pokemon = await searchPokemonByName(search, signal);
  return pokemon ? [pokemon] : [];
}
