import { create } from 'zustand';
import { useAuthStore } from './authStore';

/**
 * Store Zustand pour la gestion des utilisateurs
 * Liste des utilisateurs pour la messagerie
 */
export const useUsersStore = create((set, get) => ({
  // État
  users: [],
  loading: false,
  error: null,

  // Actions
  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée');
        }
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await response.json();

      // Filtrer l'utilisateur connecté de la liste
      const currentUserId = useAuthStore.getState().user?.id;
      const filteredUsers = data.filter(user => user.id !== currentUserId);

      set({
        users: filteredUsers,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUsersStore;