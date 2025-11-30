import { create } from 'zustand';

/**
 * Store de gestion des utilisateurs et messages
 * Je gère les listes d'utilisateurs, les salons et les messages
 */
export const useUsersStore = create((set, get) => ({
    users: [],
    rooms: [],
    messages: {},
    roomMessages: {},
    loading: false,
    error: null,

    /**
     * Je récupère la liste des utilisateurs disponibles
     */
    fetchUsers: async () => {
        set({ loading: true });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                set({ users: data.users, loading: false });
            } else {
                set({ loading: false, error: data.message });
            }
        } catch (error) {
            set({ loading: false, error: 'Erreur de chargement' });
        }
    },

    /**
     * Je récupère la liste des salons
     */
    fetchRooms: async () => {
        set({ loading: true });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/rooms', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                set({ rooms: data.rooms, loading: false });
            } else {
                set({ loading: false, error: data.message });
            }
        } catch (error) {
            set({ loading: false, error: 'Erreur de chargement des salons' });
        }
    },

    /**
     * Je récupère les messages avec un utilisateur
     */
    fetchMessages: async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages?userId=${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [userId]: data.messages,
                    },
                }));
            }
        } catch (error) {
            console.error('Erreur fetchMessages:', error);
        }
    },

    /**
     * Je récupère les messages d'un salon
     */
    fetchRoomMessages: async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/room-messages?roomId=${roomId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                set((state) => ({
                    roomMessages: {
                        ...state.roomMessages,
                        [roomId]: data.messages,
                    },
                }));
            }
        } catch (error) {
            console.error('Erreur fetchRoomMessages:', error);
        }
    },

    /**
     * Je envoie un message à un utilisateur
     */
    sendMessage: async (userId, content) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId, content }),
            });

            const data = await response.json();

            if (data.success) {
                get().fetchMessages(userId);
            }
        } catch (error) {
            console.error('Erreur sendMessage:', error);
        }
    },

    /**
     * Je envoie un message dans un salon
     */
    sendRoomMessage: async (roomId, content) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/room-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ roomId, content }),
            });

            const data = await response.json();

            if (data.success) {
                get().fetchRoomMessages(roomId);
            }
        } catch (error) {
            console.error('Erreur sendRoomMessage:', error);
        }
    },
}));
