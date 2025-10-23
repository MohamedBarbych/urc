import { create } from 'zustand';
import { useAuthStore } from './authStore';

// ✅ NOUVELLE FONCTION : Récupère le token depuis authStore directement
const getAuthToken = () => {
    const token = useAuthStore.getState().token;

    if (!token) {
        console.error('❌ Aucun token dans authStore');
    } else {
        console.log('✅ Token récupéré depuis authStore:', token.substring(0, 20) + '...');
    }

    return token;
};

export const useUsersStore = create((set, get) => ({
    users: [],
    rooms: [],
    messages: {},
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const token = getAuthToken();

            if (!token) {
                throw new Error('Non authentifié - pas de token');
            }

            console.log('🔍 Appel /api/users');

            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Authentication': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Réponse /api/users - Status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Utilisateurs reçus:', data);

            const usersList = data.users || data.data || data || [];

            set({ users: usersList, loading: false });
        } catch (error) {
            console.error('❌ Erreur fetchUsers:', error);
            set({ error: error.message, loading: false, users: [] });
        }
    },

    fetchRooms: async () => {
        try {
            const token = getAuthToken();

            if (!token) {
                set({ rooms: [] });
                return;
            }

            const response = await fetch('/api/rooms', {
                method: 'GET',
                headers: {
                    'Authentication': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                set({ rooms: [] });
                return;
            }

            const data = await response.json();
            const roomsList = data.rooms || data.data || data || [];
            set({ rooms: roomsList });
        } catch (error) {
            console.error('❌ Erreur fetchRooms:', error);
            set({ rooms: [] });
        }
    },

    fetchMessages: async (recipientId) => {
        if (!recipientId) return;

        try {
            const token = getAuthToken();

            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(`/api/messages?recipientId=${recipientId}`, {
                method: 'GET',
                headers: {
                    'Authentication': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Erreur ${response.status}`);

            const data = await response.json();

            if (data.success) {
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [recipientId]: data.messages || []
                    }
                }));
            }
        } catch (error) {
            console.error('❌ Erreur fetchMessages:', error);
            set((state) => ({
                messages: {
                    ...state.messages,
                    [recipientId]: []
                }
            }));
        }
    },

    sendMessage: async (recipientId, content) => {
        if (!recipientId || !content) {
            return { success: false, error: 'Données manquantes' };
        }

        try {
            const token = getAuthToken();

            if (!token) {
                return { success: false, error: 'Non authentifié' };
            }

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Authentication': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientId: parseInt(recipientId),
                    content: content.trim(),
                    type: 'text'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur envoi');
            }

            const data = await response.json();

            if (data.success) {
                setTimeout(() => get().fetchMessages(recipientId), 500);
                return { success: true, data: data.data };
            }

            return { success: false, error: 'Échec envoi' };
        } catch (error) {
            console.error('❌ Erreur sendMessage:', error);
            return { success: false, error: error.message };
        }
    },

    clearMessages: (userId) => {
        set((state) => {
            const newMessages = { ...state.messages };
            delete newMessages[userId];
            return { messages: newMessages };
        });
    },

    reset: () => {
        set({
            users: [],
            rooms: [],
            messages: {},
            loading: false,
            error: null
        });
    }
}));