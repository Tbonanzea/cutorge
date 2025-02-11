import { AuthProvider, UserRole } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  authProvider?: AuthProvider;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
