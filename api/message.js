import { checkSession, unauthorizedResponse } from "../lib/session.js";
import { Redis } from '@upstash/redis';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

/**
 * Génère une clé Redis bidirectionnelle pour une conversation entre 2 utilisateurs
 * La clé est la même peu importe l'ordre des utilisateurs (A->B = B->A)
 */
function getConversationKey(userId1, userId2) {
    const ids = [userId1, userId2].sort((a, b) => a - b);
    return `msg:${ids[0]}:${ids[1]}`; // Nouveau préfixe propre
}

export default async function handler(request) {
    try {
        const connected = await checkSession(request);

        if (!connected) {

            console.log("Not connected");
            return unauthorizedResponse();
        }

        // Récupérer l'utilisateur depuis Redis
        let token = new Headers(request.headers).get('Authentication');
        if (token) {
            token = token.replace("Bearer ", "");
        }
        const user = await redis.get(token);

        if (!user) {
            return unauthorizedResponse();
        }

        // Gérer GET pour récupérer les messages
        if (request.method === 'GET') {
            const url = new URL(request.url);
            const recipientId = url.searchParams.get('recipientId');

            if (!recipientId) {
                return new Response(JSON.stringify({
                    code: "INVALID_DATA",
                    message: "recipientId est requis"
                }), {
                    status: 400,
                    headers: { 'content-type': 'application/json' },
                });
            }

            const conversationKey = getConversationKey(user.id, parseInt(recipientId));

            // Récupérer tous les messages de la conversation (LRANGE 0 -1)
            const messagesJson = await redis.lrange(conversationKey, 0, -1);

            // Parser les messages JSON
            const messages = messagesJson.map(msgJson => {
                try {
                    return JSON.parse(msgJson);
                } catch (e) {
                    console.error("Error parsing message:", e);
                    return null;
                }
            }).filter(msg => msg !== null);

            // Inverser l'ordre car LPUSH ajoute au début (on veut les plus anciens en premier)
            messages.reverse();

            console.log(`Récupération de ${messages.length} messages pour ${conversationKey}`);

            return new Response(JSON.stringify({
                success: true,
                messages: messages
            }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Gérer POST pour envoyer un message
        if (request.method === 'POST') {
            const body = await request.json();
            const { recipientId, content, type = 'text' } = body;

            // Validation
            if (!recipientId || !content) {
                return new Response(JSON.stringify({
                    code: "INVALID_DATA",
                    message: "recipientId et content sont requis"
                }), {
                    status: 400,
                    headers: { 'content-type': 'application/json' },
                });
            }

            // Créer l'objet message
            const message = {
                senderId: user.id,
                senderUsername: user.username,
                recipientId: recipientId,
                content: content,
                type: type,
                timestamp: new Date().toISOString()
            };

            // Générer la clé de conversation bidirectionnelle
            const conversationKey = getConversationKey(user.id, recipientId);

            // Stocker le message avec LPUSH (ajoute au début de la liste)
            await redis.lpush(conversationKey, JSON.stringify(message));

            // Définir l'expiration à 24h (86400 secondes)
            await redis.expire(conversationKey, 86400);

            console.log(`Message enregistré dans ${conversationKey} par ${user.username}`);

            // TODO : Récupérer les infos du destinataire depuis Redis/DB
            // TODO : Envoyer une notification Push au destinataire

            return new Response(JSON.stringify({
                success: true,
                message: "Message envoyé",
                data: message
            }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Méthode non supportée
        return new Response(JSON.stringify({
            code: "METHOD_NOT_ALLOWED",
            message: "Seules les méthodes GET et POST sont supportées"
        }), {
            status: 405,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error("Erreur dans le service message:", error);
        return new Response(JSON.stringify({
            code: "INTERNAL_ERROR",
            message: error.message
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}

//
// import {getConnecterUser, triggerNotConnected} from "../lib/session";
// // import { Redis } from '@upstash/redis';
// // const PushNotifications = require("@pusher/push-notifications-server");
//
// export default async (request, response) => {
//     try {
//         const headers = new Headers(request.headers);
//         const user = await getConnecterUser(request);
//         if (user === undefined || user === null) {
//             console.log("Not connected");
//             triggerNotConnected(response);
//         }
//
//         const message = await request.body;
//
//         // TODO : save message
//
//         response.send("OK");
//     } catch (error) {
//         console.log(error);
//         response.status(500).json(error);
//     }
// };
