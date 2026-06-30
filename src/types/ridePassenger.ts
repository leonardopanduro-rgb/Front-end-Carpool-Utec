export interface RidePassenger {
  id: number;
  passengerId: number;
  rideId: number;
  seatsReserved: number;
  pickupPoint: string;
  passengerName?: string | null;
  passengerCareer?: string | null;
  passengerRating?: number | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
}