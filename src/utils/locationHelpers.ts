import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Requests foreground location permission and returns current coords.
 * Returns null if permission denied or location unavailable.
 */
export const getCurrentCoords = async (): Promise<Coords | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
};

/** Returns null if either lat or lng is missing/invalid */
export const validateCoordPair = (
  lat: string, lng: string
): { latitude: number; longitude: number } | null => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng)) return null;
  return { latitude: parsedLat, longitude: parsedLng };
};