import { User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Reception Desk', role: UserRole.FRONT_DESK },
  { id: 'u2', name: 'Sarah (Manager)', role: UserRole.MANAGER },
  { id: 'u3', name: 'Mike (Mechanic)', role: UserRole.MECHANIC },
  { id: 'u4', name: 'Dave (Mechanic)', role: UserRole.MECHANIC },
];

export const getMechanics = (): User[] => {
  return MOCK_USERS.filter(u => u.role === UserRole.MECHANIC);
};

export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.id === id);
};