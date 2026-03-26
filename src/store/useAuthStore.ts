import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'user' | null;

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    role: UserRole;

    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (isLoading: boolean) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    role: null,

    setUser: (user) =>
        set({
            user,
            role: (user?.user_metadata?.role as UserRole | undefined) ?? 'user',
        }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),

    signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, isLoading: false, role: null });
    },
}));