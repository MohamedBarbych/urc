import { checkSession, unauthorizedResponse } from "../lib/session.js";
import { Redis } from '@upstash/redis';




export const config = {
    runtime: 'edge',
};


const redis = Redis.fromEnv();

function getConversationKey(userId1, userId2) {
    const ids = [userId1, userId2].sort((a, b) => a - b);
    return `msg:${ids[0]}:${ids[1]}`;
}

export default async function handler(request) {
    try {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authentication',
                },
            });
        }

        const connected = await checkSession(request);
        if (!connected) {
            return unauthorizedResponse();
        }

        let token = new Headers(request.headers).get('Authentication');
        if (token) {
            token = token.replace("Bearer ", "");
        }

        const user = await redis.get(token);
        if (!user) {
            return unauthorizedResponse();
        }

        // GET
        if (request.method === 'GET') {
            const url = new URL(request.url);
            const recipientId = url.searchParams.get('recipientId');

            if (!recipientId) {
                return new Response(JSON.stringify({
                    code: "INVALID_DATA",
                    message: "recipientId requis"
                }), { status: 400, headers: { 'content-type': 'application/json' } });
            }

            const conversationKey = getConversationKey(user.id, parseInt(recipientId));
            const messagesRaw = await redis.lrange(conversationKey, 0, -1);

            const messages = messagesRaw
                .map(msgRaw => {
                    if (typeof msgRaw === 'object' && msgRaw !== null) {
                        return msgRaw;
                    }
                    if (typeof msgRaw === 'string') {
                        try {
                            return JSON.parse(msgRaw);
                        } catch (e) {
                            return null;
                        }
                    }
                    return null;
                })
                .filter(msg => msg !== null);

            messages.reverse();

            return new Response(JSON.stringify({
                success: true,
                messages: messages
            }), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            });
        }

        // POST
        if (request.method === 'POST') {
            const body = await request.json();
            const { recipientId, content, type = 'text' } = body;

            if (!recipientId || !content || content.trim().length === 0) {
                return new Response(JSON.stringify({
                    code: "INVALID_DATA",
                    message: "recipientId et content requis"
                }), { status: 400, headers: { 'content-type': 'application/json' } });
            }

            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                senderId: user.id,
                senderUsername: user.username,
                recipientId: parseInt(recipientId),
                content: content.trim(),
                type: type,
                timestamp: new Date().toISOString(),
                read: false
            };

            const conversationKey = getConversationKey(user.id, parseInt(recipientId));
            const messageString = JSON.stringify(message);

            await redis.lpush(conversationKey, messageString);
            await redis.expire(conversationKey, 604800);

            return new Response(JSON.stringify({
                success: true,
                message: "Message envoyé",
                data: message
            }), {
                status: 201,
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            });
        }

        return new Response(JSON.stringify({
            code: "METHOD_NOT_ALLOWED",
            message: "GET/POST uniquement"
        }), { status: 405, headers: { 'content-type': 'application/json' } });

    } catch (error) {
        console.error("Erreur:", error);
        return new Response(JSON.stringify({
            code: "INTERNAL_ERROR",
            message: error.message
        }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
}