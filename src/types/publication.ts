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
  /** Precio por asiento (S/) fijado por el conductor. Null en publicaciones de pasajero. */
  pricePerSeat: number | null;
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
  /** Precio por asiento (S/) fijado por el conductor. */
  pricePerSeat: number | null;
  vehicleId: number | null;
}