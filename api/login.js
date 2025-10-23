import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, password } = await request.json();

        console.log(`🔐 Tentative de connexion: ${username}`);

        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();
        const { rowCount, rows } = await client.sql`
            SELECT * FROM users
            WHERE username = ${username} AND password = ${hashed64}
        `;

        if (rowCount !== 1) {
            console.log('❌ Identifiants invalides');
            return new Response(JSON.stringify({
                success: false,
                code: "UNAUTHORIZED",
                message: "Identifiant ou mot de passe incorrect"
            }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Mise à jour last_login
        await client.sql`
            UPDATE users
            SET last_login = now()
            WHERE user_id = ${rows[0].user_id}
        `;

        // Génération du token
        const token = crypto.randomUUID().toString();

        const user = {
            id: rows[0].user_id,
            username: rows[0].username,
            email: rows[0].email,
            externalId: rows[0].external_id
        };

        console.log(`✅ User trouvé: ${user.username} (ID: ${user.id})`);
        console.log(`🎫 Token généré: ${token}`);

        // Stocker dans Redis (token -> user)
        await redis.set(token, user, { ex: 86400 }); // 24h au lieu de 1h

        // Stocker aussi dans le hash users
        const userInfo = {};
        userInfo[user.id] = user;
        await redis.hset("users", userInfo);

        console.log(`💾 Token stocké dans Redis`);

        // IMPORTANT : Retourner avec success: true
        return new Response(JSON.stringify({
            success: true,      // ← AJOUTÉ
            token: token,
            user: user
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}