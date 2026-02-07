import { AuthProvider, UserRole } from '@/generated/prisma/browser';

export interface User {
  id: string;
  email: string;
  authProvider?: AuthProvider[];
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
