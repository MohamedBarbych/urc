import { Redis } from '@upstash/redis';
import { verifySession } from '../lib/session';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

/**
 * Gestionnaire de liste d'utilisateurs
 * Je récupère tous les utilisateurs disponibles pour la messagerie
 */
export default async function handler(request) {
    const session = await verifySession(request);
    if (!session) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Non autorisé'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const allUsers = await redis.hgetall('users');
        
        const users = Object.values(allUsers || {})
            .filter(user => user.id !== session.userId);

        return new Response(JSON.stringify({
            success: true,
            users: users
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Erreur serveur'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
