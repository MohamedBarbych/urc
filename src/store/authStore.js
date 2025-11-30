import { create } from 'zustand';

const API_URL = window.API_BASE_URL || '';

/**
 * Store d'authentification
 * Je gère la connexion, l'inscription et la session utilisateur
 */
export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,

    /**
     * Je gère la connexion d'un utilisateur
     */
    login: async (username, password) => {
        console.log('🔵 LOGIN APPELÉ:', { username, password });
        set({ loading: true, error: null });

        try {
            console.log('🔵 FETCH vers:', `${API_URL}/api/login`);
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            console.log('🔵 RESPONSE:', response.status, response.statusText);
            const data = await response.json();
            console.log('🔵 DATA:', data);

            if (data.success) {
                set({
                    user: data.user,
                    token: data.token,
                    loading: false,
                    error: null,
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                console.log('✅ LOGIN RÉUSSI');
                return { success: true };
            } else {
                console.log('❌ LOGIN ÉCHOUÉ:', data.message);
                set({ loading: false, error: data.message });
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('❌ ERREUR FETCH:', error);
            set({ loading: false, error: 'Erreur de connexion' });
            return { success: false, error: 'Erreur de connexion' };
        }
    },

    /**
     * Je gère l'inscription d'un nouvel utilisateur
     */
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
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                return { success: true };
            } else {
                set({ loading: false, error: data.message });
                return { success: false, error: data.message };
            }
        } catch (error) {
            set({ loading: false, error: 'Erreur d\'inscription' });
            return { success: false, error: 'Erreur d\'inscription' };
        }
    },

    /**
     * Je déconnecte l'utilisateur
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, error: null });
    },

    /**
     * Je nettoie les erreurs
     */
    clearError: () => set({ error: null }),

    /**
     * Je restaure la session depuis localStorage
     */
    restoreSession: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            set({
                token,
                user: JSON.parse(user),
            });
        }
    },
}));
