import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    avatar_url?: string;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    setAuth: (user: UserProfile | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setAuth: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'ax-auth-storage',
        }
    )
);
