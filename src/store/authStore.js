import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store Zustand pour l'authentification
 * Beaucoup plus simple que Redux Toolkit !
 * 
 * Avantages :
 * - Pas de Provider nécessaire
 * - API ultra-simple avec hooks
 * - Persistance automatique avec middleware
 * - Moins de boilerplate
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (username, password) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Erreur de connexion');
          }

          const data = await response.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Erreur réseau',
            isAuthenticated: false,
          });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ loading: true });

        try {
          // Optionnel : appeler un endpoint de logout
          // await fetch('/api/logout', { method: 'POST', ... });

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      clearError: () => set({ error: null }),

      // Restaurer la session (appelé automatiquement par persist)
      restoreSession: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage', // Clé dans localStorage
      partialize: (state) => ({
        // On persiste uniquement ces champs
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
