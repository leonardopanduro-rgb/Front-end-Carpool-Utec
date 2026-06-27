export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
};

export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDateTime = (iso: string): string =>
  `${formatDate(iso)} ${formatTime(iso)}`;

export const formatRating = (rating: number | null): string =>
  rating != null ? `⭐ ${rating.toFixed(1)}` : 'Sin calificación';

export const formatDistance = (km: number | null): string =>
  km != null ? `${km.toFixed(1)} km de UTEC` : '';

/** Converts JS Date to YYYY-MM-DDTHH:mm:ss (no Z, no timezone) */
export const toLocalIso = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const isPast = (iso: string): boolean =>
  new Date(iso) < new Date();