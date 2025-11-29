import { User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Reception', role: UserRole.COUNTER },
  { id: 'u2', name: 'Sarah', role: UserRole.MANAGER },
  { id: 'u3', name: 'Mike', role: UserRole.MECHANIC },
  { id: 'u4', name: 'Dave', role: UserRole.MECHANIC },
  { id: 'u5', name: 'Alice', role: UserRole.ADMIN },
  { id: 'u6', name: 'Bob', role: UserRole.OWNER },
];

export const getMechanics = (): User[] => {
  return MOCK_USERS.filter(u => u.role === UserRole.MECHANIC);
};

export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.id === id);
};