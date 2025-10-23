import { create } from 'zustand';
import { useAuthStore } from './authStore';

/**
 * Store Zustand pour la gestion des utilisateurs et des messages
 */
export const useUsersStore = create((set, get) => ({
  users: [],
  rooms: [],
  loading: false,
  error: null,
  messages: {},
  roomMessages: {},

  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
        localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `Bearer ${token}`,
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
      const filteredUsers = data.filter(user => user.user_id !== currentUserId);

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

  fetchMessages: async (recipientId) => {
    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`/api/message?recipientId=${recipientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée');
        }
        throw new Error('Erreur lors de la récupération des messages');
      }

      const data = await response.json();
      const fetchedMessages = data.messages || [];

      console.log('📦 Messages récupérés de Redis:', fetchedMessages.length);

      const { messages } = get();

      // Ne mettre à jour que si on a vraiment des messages OU si c'est la première fois
      const currentMessages = messages[recipientId] || [];

      // Toujours prendre les messages de Redis comme source de vérité
      set({
        messages: {
          ...messages,
          [recipientId]: fetchedMessages,
        },
      });

      return { success: true, messages: fetchedMessages };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  sendMessage: async (recipientId, content) => {
    try {
      const token = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      console.log('🔐 Token:', token ? 'Présent' : 'Absent');
      console.log('👤 User:', currentUser);
      console.log('📨 Envoi vers recipientId:', recipientId, 'content:', content);

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          content,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error('Erreur lors de l\'envoi du message: ' + errorText);
      }

      const result = await response.json();
      console.log('✅ Résultat serveur:', result);

      const newMessage = result.data;

      const { messages } = get();
      const conversationMessages = messages[recipientId] || [];

      set({
        messages: {
          ...messages,
          [recipientId]: [...conversationMessages, newMessage],
        },
      });

      return { success: true };
    } catch (error) {
      console.error('💥 Exception dans sendMessage:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchRooms: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée');
        }
        throw new Error('Erreur lors de la récupération des salons');
      }

      const data = await response.json();

      set({
        rooms: data,
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
