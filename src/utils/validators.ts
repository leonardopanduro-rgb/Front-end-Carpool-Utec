import { CAREERS } from '../data/careers';

export const isUtecEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+-]+@utec.edu.pe$/.test(email.trim());

export const isValidPassword = (password: string): boolean =>
  password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

export const isValidPhone = (phone: string): boolean =>
  /^[0-9]{9}$/.test(phone.trim());

export const isValidStudentCode = (code: string): boolean =>
  /^U[0-9]{9}$/.test(code.trim());

export const isValidCycle = (cycle: number): boolean =>
  Number.isInteger(cycle) && cycle >= 1 && cycle <= 12;

export const isValidCareer = (value: string): boolean =>
  CAREERS.some(c => c.value === value);

export const isNotEmpty = (value: string): boolean =>
  value.trim().length > 0;

// Tope de asientos alineado con el backend (VehicleRequestDto @Max(20)).
export const MAX_VEHICLE_SEATS = 20;

export const isValidSeats = (seats: number): boolean =>
  Number.isInteger(seats) && seats >= 1 && seats <= MAX_VEHICLE_SEATS;

// Formato de placa alineado con el backend (VehicleRequestDto @Pattern). Se normaliza a mayusculas.
export const isValidPlate = (plate: string): boolean =>
  /^[A-Z0-9]{3}-?[A-Z0-9]{3,4}$/.test(plate.trim().toUpperCase());

// Precio por asiento: numero valido mayor que 0.
export const isValidPricePerSeat = (price: number): boolean =>
  Number.isFinite(price) && price > 0;
