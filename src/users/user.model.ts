export const USER_ROLES = ['admin', 'member'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}
