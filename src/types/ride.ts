export interface Ride {
  id: number;
  publicationId: number;
  driverId: number;
  vehicleId: number;
  fromUTEC: boolean;
  destinationOrOrigin: string;
  departureTime: string;
}