export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  studentCode: string;
  career: string;
  cycle: number;
  rating: number | null;
  role: UserRole;
}