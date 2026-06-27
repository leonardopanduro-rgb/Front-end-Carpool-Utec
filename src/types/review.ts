export interface Review {
  id: number;
  rideId: number;
  reviewerId: number;
  reviewedId: number;
  rating: number;
  comment: string;
}

export interface ReviewRequest {
  rideId: number;
  reviewedId: number;
  rating: number;
  comment: string;
}