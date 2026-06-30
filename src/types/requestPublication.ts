export type RequestStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface RequestPublication {
  id: number;
  publicationId: number;
  requesterId: number;
  requesterIsDriver: boolean;
  seats: number;
  message: string;
  pickupPointOrDestine: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
  status: RequestStatus;
  requesterName?: string | null;
  requesterCareer?: string | null;
  requesterRating?: number | null;
  proposedFare?: number | null;
  counterFare?: number | null;
  agreedFare?: number | null;
}

export interface RequestPublicationRequest {
  requesterIsDriver: boolean;
  seats: number;
  message: string;
  pickupPointOrDestine: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
  proposedFare?: number | null;
}

export interface AcceptRequest {
  vehicleId: number;
}