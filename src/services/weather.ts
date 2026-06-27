// Open-Meteo: no API key needed. UTEC is in Barranco (-12.1516, -77.0223)
const UTEC_LAT = -12.1516;
const UTEC_LNG = -77.0223;

export interface WeatherInfo {
  temperature: number;
  description: string;
  emoji: string;
}

const WMO_CODES: Record<number, { description: string; emoji: string }> = {
  0: { description: 'Despejado', emoji: '☀️' },
  1: { description: 'Mayormente despejado', emoji: '🌤️' },
  2: { description: 'Parcialmente nublado', emoji: '⛅' },
  3: { description: 'Nublado', emoji: '☁️' },
  45: { description: 'Neblina', emoji: '🌫️' },
  48: { description: 'Neblina helada', emoji: '🌫️' },
  51: { description: 'Llovizna ligera', emoji: '🌦️' },
  61: { description: 'Lluvia ligera', emoji: '🌧️' },
  63: { description: 'Lluvia moderada', emoji: '🌧️' },
  80: { description: 'Chubascos', emoji: '🌦️' },
};

export const weatherService = {
  getCurrent: async (): Promise<WeatherInfo | null> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${UTEC_LAT}&longitude=${UTEC_LNG}&current_weather=true`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const cw = data.current_weather;
      const code = cw.weathercode as number;
      const info = WMO_CODES[code] ?? { description: 'Variable', emoji: '🌡️' };
      return { temperature: cw.temperature, ...info };
    } catch {
      return null; // weather is non-critical
    }
  },
};