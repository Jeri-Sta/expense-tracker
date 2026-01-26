export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  isInvitedUser: boolean;
  canInvite: boolean;
  workspaceId: string;
}
