export interface Publication {
  id: number;
  fromUTEC: boolean;
  driverToPassenger: boolean;
  seats: number;
  titulo: string;
  descripcion: string;
  destinationOrOrigin: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
  distanceToUtecKm: number | null;
  departureTime: string;
  authorId: number;
  vehicleId: number | null;
  rideId: number | null;
}

export interface PublicationRequest {
  fromUTEC: boolean;
  driverToPassenger: boolean;
  seats: number;
  titulo: string;
  descripcion: string;
  destinationOrOrigin: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
  departureTime: string;
  vehicleId: number | null;
}