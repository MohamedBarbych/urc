import { create } from 'zustand';

const API_URL = window.API_BASE_URL || '';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    login: async (username, password) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                set({
                    user: data.user,
                    token: data.token,
                    loading: false,
                    error: null,
                    isAuthenticated: true,
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                return { success: true };
            } else {
                set({ loading: false, error: data.message, isAuthenticated: false });
                return { success: false, error: data.message };
            }
        } catch (error) {
            set({ loading: false, error: 'Erreur de connexion', isAuthenticated: false });
            return { success: false, error: 'Erreur de connexion' };
        }
    },

    register: async (username, email, password) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                set({
                    user: data.user,
                    token: data.token,
                    loading: false,
                    error: null,
                    isAuthenticated: true,
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                return { success: true };
            } else {
                set({ loading: false, error: data.message, isAuthenticated: false });
                return { success: false, error: data.message };
            }
        } catch (error) {
            set({ loading: false, error: 'Erreur d\'inscription', isAuthenticated: false });
            return { success: false, error: 'Erreur d\'inscription' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, error: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),

    restoreSession: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            set({
                token,
                user: JSON.parse(user),
                isAuthenticated: true,
            });
        }
    },
}));
