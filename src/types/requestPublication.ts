export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

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
}

export interface RequestPublicationRequest {
  requesterIsDriver: boolean;
  seats: number;
  message: string;
  pickupPointOrDestine: string;
  externalLatitude: number | null;
  externalLongitude: number | null;
}

export interface AcceptRequest {
  vehicleId: number;
}