import { POLAND_PHOTON_BBOX } from '../constants/cities';

const PHOTON_BASE = 'https://photon.komoot.io';

export type CitySearchResult = {
  id: string;
  /** Value stored in profile / filter (primary locality name). */
  name: string;
  /** Extra line for disambiguation (e.g. województwo). */
  subtitle?: string;
};

type PhotonFeature = {
  geometry?: { type?: string; coordinates?: [number, number] };
  properties?: Record<string, unknown>;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function isPoland(props: Record<string, unknown>): boolean {
  const code = props.countrycode;
  return typeof code === 'string' && code.toLowerCase() === 'pl';
}

function placeSubtitle(props: Record<string, unknown>): string | undefined {
  const state = props.state;
  if (typeof state === 'string' && state.trim()) {
    return state.trim();
  }
  const county = props.county;
  if (typeof county === 'string' && county.trim()) {
    return county.trim();
  }
  return undefined;
}

function localityName(props: Record<string, unknown>): string | undefined {
  const name = props.name;
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  return undefined;
}

/** Best label for reverse results (avoid postcode / street as "name"). */
function reverseLocalityName(props: Record<string, unknown>): string | undefined {
  const osmValue = props.osm_value;
  const skipName =
    osmValue === 'postcode' ||
    osmValue === 'house' ||
    osmValue === 'street' ||
    osmValue === 'road' ||
    props.type === 'house';

  const city = props.city;
  if (typeof city === 'string' && city.trim()) {
    return city.trim();
  }
  const town = props.town;
  if (typeof town === 'string' && town.trim()) {
    return town.trim();
  }
  const village = props.village;
  if (typeof village === 'string' && village.trim()) {
    return village.trim();
  }
  const locality = props.locality;
  if (typeof locality === 'string' && locality.trim()) {
    return locality.trim();
  }

  if (!skipName) {
    return localityName(props);
  }

  return undefined;
}

function placeRank(props: Record<string, unknown>): number {
  const osmKey = props.osm_key;
  const osmValue = props.osm_value;
  const type = props.type;
  if (osmKey === 'place') {
    if (osmValue === 'city') return 0;
    if (osmValue === 'town') return 1;
    if (osmValue === 'village') return 2;
    if (osmValue === 'hamlet' || osmValue === 'suburb' || osmValue === 'neighbourhood') return 3;
  }
  if (type === 'city') return 0;
  if (type === 'town') return 1;
  if (type === 'village') return 2;
  return 4;
}

function featureId(feature: PhotonFeature, index: number): string {
  const props = feature.properties;
  const osmId = props && typeof props.osm_id === 'number' ? String(props.osm_id) : '';
  const coords = feature.geometry?.coordinates;
  const lon = coords?.[0] ?? index;
  const lat = coords?.[1] ?? index;
  return osmId || `${lat},${lon}`;
}

function parseSearchFeatures(data: PhotonResponse): CitySearchResult[] {
  const features = data.features ?? [];
  const rows: CitySearchResult[] = [];
  const seen = new Set<string>();

  const sorted = [...features].sort((a, b) => {
    const pa = (a.properties ?? {}) as Record<string, unknown>;
    const pb = (b.properties ?? {}) as Record<string, unknown>;
    return placeRank(pa) - placeRank(pb);
  });

  for (let i = 0; i < sorted.length; i++) {
    const feature = sorted[i];
    const props = feature.properties;
    if (!props || !isPoland(props as Record<string, unknown>)) {
      continue;
    }
    const p = props as Record<string, unknown>;
    const name = localityName(p);
    if (!name) {
      continue;
    }
    const subtitle = placeSubtitle(p);
    const dedupeKey = subtitle ? `${name}|${subtitle}` : name;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    rows.push({
      id: featureId(feature, i),
      name,
      subtitle,
    });
  }

  return rows;
}

/**
 * Forward geocoding: Polish cities / towns / villages via Photon (OpenStreetMap),
 * bounded to Poland. No API key; respect fair use (debounce in UI).
 */
export async function searchPolishPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<CitySearchResult[]> {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }

  // Photon rejects some `lang` values with 400 (e.g. `pl`). Omit lang; filter PL client-side.
  const bbox = POLAND_PHOTON_BBOX.join(',');
  const url = `${PHOTON_BASE}/api/?q=${encodeURIComponent(q)}&bbox=${bbox}&limit=25`;

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PawsConnect/1.0 (pet adoption app)',
    },
  });

  if (!res.ok) {
    throw new Error(`Wyszukiwanie miasta nie powiodło się (${res.status}).`);
  }

  const data = (await res.json()) as PhotonResponse;
  return parseSearchFeatures(data);
}

/**
 * Reverse geocoding: coordinates → locality name in Poland (Photon).
 */
export async function reverseGeocodeLocality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${PHOTON_BASE}/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PawsConnect/1.0 (pet adoption app)',
    },
  });

  if (!res.ok) {
    throw new Error(`Odwrotne geokodowanie nie powiodło się (${res.status}).`);
  }

  const data = (await res.json()) as PhotonResponse;
  const features = data.features ?? [];

  const ranked = [...features].sort((a, b) => {
    const pa = (a.properties ?? {}) as Record<string, unknown>;
    const pb = (b.properties ?? {}) as Record<string, unknown>;
    return placeRank(pa) - placeRank(pb);
  });

  for (const feature of ranked) {
    const props = feature.properties as Record<string, unknown> | undefined;
    if (!props || !isPoland(props)) {
      continue;
    }
    const name = reverseLocalityName(props);
    if (name) {
      return name;
    }
  }

  return null;
}
