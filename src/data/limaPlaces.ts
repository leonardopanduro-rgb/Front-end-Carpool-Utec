export interface LimaDistrict {
  name: string;
  lat: number;
  lng: number;
}

export const LIMA_DISTRICTS: LimaDistrict[] = [
  { name: 'Barranco',      lat: -12.1508, lng: -77.0222 },
  { name: 'Miraflores',    lat: -12.1219, lng: -77.0299 },
  { name: 'San Isidro',    lat: -12.1000, lng: -77.0355 },
  { name: 'Surco',         lat: -12.1480, lng: -76.9939 },
  { name: 'San Borja',     lat: -12.1024, lng: -76.9981 },
  { name: 'La Molina',     lat: -12.0839, lng: -76.9450 },
  { name: 'Chorrillos',    lat: -12.1702, lng: -77.0211 },
  { name: 'Pueblo Libre',  lat: -12.0736, lng: -77.0633 },
  { name: 'Jesús María',   lat: -12.0706, lng: -77.0477 },
  { name: 'Lince',         lat: -12.0869, lng: -77.0347 },
];

export const DISTRICT_NAMES = LIMA_DISTRICTS.map(d => d.name);

// UTEC coordinates (Barranco campus)
export const UTEC_COORDS = { lat: -12.1516, lng: -77.0223 };