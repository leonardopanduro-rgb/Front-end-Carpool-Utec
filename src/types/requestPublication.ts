export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface RequestPublication {
  id: number;
  publicationId: number;
  requesterId: number;
  requestedSeats: number;
  message: string;
  pickupPointOrDestine: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
  status: RequestStatus;
  requesterName?: string | null;
  requesterCareer?: string | null;
  requesterRating?: number | null;
  requesterPhotoUrl?: string | null;
  pricePerSeat?: number | null;
}

export interface RequestPublicationRequest {
  requestedSeats: number;
}

export interface AcceptRequest {
  vehicleId: number;
}
