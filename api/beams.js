import { checkSession, unauthorizedResponse } from "../lib/session.js";
import { Redis } from '@upstash/redis';
import PushNotifications from "@pusher/push-notifications-server";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        console.log('🔔 === API BEAMS appelée ===');

        // Vérifier la session
        const connected = await checkSession(request);
        if (!connected) {
            console.log("❌ Session non valide");
            return unauthorizedResponse();
        }

        // Récupérer le token
        let token = new Headers(request.headers).get('Authentication');
        if (token) {
            token = token.replace("Bearer ", "");
        }

        if (!token) {
            console.log("❌ Pas de token fourni");
            return new Response(JSON.stringify({
                error: 'No token provided'
            }), {
                status: 401,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Récupérer l'utilisateur depuis Redis
        const user = await redis.get(token);
        if (!user || !user.externalId) {
            console.log("❌ Utilisateur non trouvé ou pas d'externalId");
            return new Response(JSON.stringify({
                error: 'User not found'
            }), {
                status: 401,
                headers: { 'content-type': 'application/json' }
            });
        }

        console.log(`✅ Génération token Beams pour: ${user.username} (externalId: ${user.externalId})`);
        console.log(`🔑 Pusher Instance ID: ${process.env.PUSHER_INSTANCE_ID}`);

        // Vérifier que les variables d'environnement existent
        if (!process.env.PUSHER_INSTANCE_ID || !process.env.PUSHER_SECRET_KEY) {
            console.error('❌ Variables Pusher manquantes !');
            return new Response(JSON.stringify({
                error: 'Pusher not configured'
            }), {
                status: 500,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Initialiser le client Beams
        const beamsClient = new PushNotifications({
            instanceId: process.env.PUSHER_INSTANCE_ID,
            secretKey: process.env.PUSHER_SECRET_KEY,
        });

        // Générer le token Beams
        const beamsToken = beamsClient.generateToken(user.externalId);

        console.log(`✅ Token Beams généré pour ${user.externalId}`);

        return new Response(JSON.stringify(beamsToken), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('❌ Erreur dans /api/beams:', error);
        console.error('Stack:', error.stack);
        return new Response(JSON.stringify({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}