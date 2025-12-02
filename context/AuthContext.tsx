
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginWithCredentials, loginWithProvider, logout as authLogout, requestPasswordReset } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  ssoLogin: (provider: 'google' | 'microsoft' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const loadSession = () => {
        const storedUser = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('auth_user');
            }
        } else {
            // PREVIEW MODE: Automatically log in as Platform Admin
            const previewUser: User = {
                id: 'u5',
                name: 'Alice (Platform Admin)',
                email: 'alice@harden.equipment',
                role: UserRole.ADMIN,
                avatarUrl: 'https://ui-avatars.com/api/?name=Alice&background=DB2777&color=fff'
            };
            setUser(previewUser);
            localStorage.setItem('auth_user', JSON.stringify(previewUser));
            localStorage.setItem('auth_token', 'preview-admin-token');
        }
        setIsLoading(false);
    };
    
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
      setIsLoading(true);
      try {
          const response = await loginWithCredentials(email, pass);
          setUser(response.user);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          localStorage.setItem('auth_token', response.token);
      } finally {
          setIsLoading(false);
      }
  };

  const ssoLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
      setIsLoading(true);
      try {
          const response = await loginWithProvider(provider);
          setUser(response.user);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          localStorage.setItem('auth_token', response.token);
      } finally {
          setIsLoading(false);
      }
  };

  const logout = async () => {
      setIsLoading(true);
      await authLogout();
      setUser(null);
      setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
      await requestPasswordReset(email);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        login, 
        ssoLogin, 
        logout,
        resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
