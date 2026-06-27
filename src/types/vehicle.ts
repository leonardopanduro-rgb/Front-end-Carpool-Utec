export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  seats: number;
  ownerId: number;
}

export interface VehicleRequest {
  plate: string;
  brand: string;
  model: string;
  color: string;
  seats: number;
}