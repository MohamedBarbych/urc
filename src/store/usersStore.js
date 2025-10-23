import { create } from 'zustand';
import { useAuthStore } from './authStore';

/**
 * Store Zustand pour la gestion des utilisateurs et des messages
 */
export const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,
  messages: {},

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

  sendMessage: async (recipientId, content) => {
    try {
      const token = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const newMessage = {
        id: Date.now(),
        senderId: currentUser.id,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
      };

      const { messages } = get();
      const conversationKey = recipientId;
      const conversationMessages = messages[conversationKey] || [];

      set({
        messages: {
          ...messages,
          [conversationKey]: [...conversationMessages, newMessage],
        },
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUsersStore;
