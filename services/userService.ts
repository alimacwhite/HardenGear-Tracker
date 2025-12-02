
import { User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Reception', 
    email: 'reception@gardengear.com', 
    role: UserRole.COUNTER,
    avatarUrl: 'https://ui-avatars.com/api/?name=Reception&background=0D8ABC&color=fff'
  },
  { 
    id: 'u2', 
    name: 'Sarah', 
    email: 'sarah@gardengear.com', 
    role: UserRole.MANAGER,
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah&background=6D28D9&color=fff'
  },
  { 
    id: 'u3', 
    name: 'Mike', 
    email: 'mike@gardengear.com', 
    role: UserRole.MECHANIC,
    avatarUrl: 'https://ui-avatars.com/api/?name=Mike&background=random'
  },
  { 
    id: 'u4', 
    name: 'Dave', 
    email: 'dave@gardengear.com', 
    role: UserRole.MECHANIC,
    avatarUrl: 'https://ui-avatars.com/api/?name=Dave&background=random'
  },
  { 
    id: 'u5', 
    name: 'Alice', 
    email: 'alice@gardengear.com', 
    role: UserRole.ADMIN,
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice&background=DB2777&color=fff'
  },
  { 
    id: 'u6', 
    name: 'Bob', 
    email: 'bob@gardengear.com', 
    role: UserRole.OWNER,
    avatarUrl: 'https://ui-avatars.com/api/?name=Bob&background=059669&color=fff'
  },
];

export const getMechanics = (): User[] => {
  return MOCK_USERS.filter(u => u.role === UserRole.MECHANIC);
};

export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.id === id);
};
