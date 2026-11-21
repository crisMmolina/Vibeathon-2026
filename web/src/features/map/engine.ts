// Map engine choice: Mapbox with a public token, otherwise MapLibre with no tiles (plan B, works offline).
export type Engine = 'mapbox' | 'maplibre'

export function pickEngine(token: string | undefined | null): Engine {
  return token && token.trim().startsWith('pk.') ? 'mapbox' : 'maplibre'
}

export const ENGINE_LABEL: Record<Engine, string> = { mapbox: 'Mapbox GL', maplibre: 'MapLibre GL, sin teselas' }
