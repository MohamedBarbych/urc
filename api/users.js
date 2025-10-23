import { checkSession, unauthorizedResponse } from "../lib/session.js";
import { Redis } from '@upstash/redis';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        // Vérifier la session
        const connected = await checkSession(request);
        if (!connected) {
            console.log("❌ Session non valide pour /api/users");
            return unauthorizedResponse();
        }

        // Récupérer l'utilisateur connecté
        let token = new Headers(request.headers).get('Authentication');
        if (token) {
            token = token.replace("Bearer ", "");
        }

        const currentUser = await redis.get(token);
        if (!currentUser) {
            console.log("❌ Token invalide pour /api/users");
            return unauthorizedResponse();
        }

        console.log(`✅ User authentifié: ${currentUser.username} (ID: ${currentUser.id})`);

        // Récupérer tous les utilisateurs du hash 'users'
        const usersHash = await redis.hgetall('users');
        console.log(`📋 Utilisateurs dans Redis:`, usersHash);

        const users = [];

        if (usersHash && typeof usersHash === 'object') {
            // Transformer le hash en tableau d'utilisateurs
            for (const [userId, userData] of Object.entries(usersHash)) {
                const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

                // ✅ FILTRER : Exclure l'utilisateur connecté
                if (user.id !== currentUser.id) {
                    users.push({
                        user_id: user.id,
                        username: user.username,
                        email: user.email
                    });
                }
            }
        }

        console.log(`✅ ${users.length} utilisateurs retournés (${currentUser.username} exclu)`);

        return new Response(JSON.stringify({
            success: true,
            users: users
        }), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });

    } catch (error) {
        console.error("❌ Erreur /api/users:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}