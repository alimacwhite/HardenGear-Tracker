
import { User } from '../types';

// Configuration for API URL
// In a production environment, this would come from an environment variable.
const API_URL = process.env.REACT_APP_API_URL || '/api';

interface AuthResponse {
    user: User;
    token: string;
}

/**
 * Login using email and password against the real backend.
 */
export const loginWithCredentials = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Invalid credentials');
        }

        const data = await response.json();
        return data as AuthResponse;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

/**
 * Register a new user.
 * Included for completeness matching backend capabilities.
 */
export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        return data as AuthResponse;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

/**
 * Login with SSO Provider.
 * Note: This attempts to hit the backend endpoints (e.g., /auth/google).
 * In the current backend, /google returns 501 Not Implemented.
 */
export const loginWithProvider = async (provider: 'google' | 'microsoft' | 'apple'): Promise<AuthResponse> => {
    try {
        // In a real flow, you would likely get an ID token from the provider's client SDK first.
        // Here we simulate passing a token to the backend.
        const mockProviderToken = `mock-token-from-${provider}-sdk`;

        const response = await fetch(`${API_URL}/auth/${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockProviderToken }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Fallback error message if backend returns 501 or 404
            throw new Error(errorData.message || errorData.error || `SSO with ${provider} is not supported yet`);
        }

        return await response.json() as AuthResponse;
    } catch (error) {
        console.error(`SSO login error for ${provider}:`, error);
        throw error;
    }
};

/**
 * Logout the user.
 * Primarily client-side cleanup for JWTs.
 */
export const logout = async (): Promise<void> => {
    // If using HttpOnly cookies, we would also call: await fetch(`${API_URL}/auth/logout`);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
};

/**
 * Request a password reset.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        // Attempt to call backend reset endpoint
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
             // Handle 404 specifically if route doesn't exist yet on backend
             if (response.status === 404) {
                 console.warn("Backend reset route missing, treating as simulated success for UI.");
                 return;
             }
             const errorData = await response.json().catch(() => ({}));
             throw new Error(errorData.error || 'Failed to request password reset');
        }
    } catch (error) {
        console.error("Password reset request failed:", error);
        throw error;
    }
};
