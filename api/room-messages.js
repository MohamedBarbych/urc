import { Redis } from '@upstash/redis';
import { verifySession } from '../lib/session';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

/**
 * Gestionnaire de messages de salon
 * Je gère l'envoi et la récupération des messages dans les salons
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

    const { method } = request;

    if (method === 'GET') {
        const url = new URL(request.url);
        const roomId = url.searchParams.get('roomId');

        if (!roomId) {
            return new Response(JSON.stringify({
                success: false,
                message: 'roomId manquant'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const key = `room:${roomId}:messages`;
        const messages = await redis.lrange(key, 0, -1);

        return new Response(JSON.stringify({
            success: true,
            messages: messages || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (method === 'POST') {
        const { roomId, content } = await request.json();

        if (!roomId || !content) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Données manquantes'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const key = `room:${roomId}:messages`;

        const message = {
            senderId: session.userId,
            senderUsername: session.username,
            roomId,
            content,
            timestamp: Date.now()
        };

        await redis.rpush(key, message);
        await redis.expire(key, 60 * 60 * 24 * 7);

        return new Response(JSON.stringify({
            success: true,
            message: 'Message envoyé'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        success: false,
        message: 'Méthode non supportée'
    }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
}
