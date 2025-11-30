import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

/**
 * Gestionnaire de connexion utilisateur
 * Je gère l'authentification et la création de sessions
 */
export default async function handler(request) {
    try {
        const { username, password } = await request.json();

        // Je hash le mot de passe pour la comparaison
        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();
        const { rowCount, rows } = await client.sql`
            SELECT * FROM users
            WHERE username = ${username} AND password = ${hashed64}
        `;

        if (rowCount !== 1) {
            return new Response(JSON.stringify({
                success: false,
                code: "UNAUTHORIZED",
                message: "Identifiant ou mot de passe incorrect"
            }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Je mets à jour la date de dernière connexion
        await client.sql`
            UPDATE users
            SET last_login = now()
            WHERE user_id = ${rows[0].user_id}
        `;

        // Je génère un token de session
        const token = crypto.randomUUID().toString();

        const user = {
            id: rows[0].user_id,
            username: rows[0].username,
            email: rows[0].email,
            externalId: rows[0].external_id
        };

        // Je stocke le token dans Redis avec expiration de 24 heures
        await redis.set(token, user, { ex: 86400 });

        // Je stocke également dans le hash users
        const userInfo = {};
        userInfo[user.id] = user;
        await redis.hset("users", userInfo);

        return new Response(JSON.stringify({
            success: true,
            token: token,
            user: user
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
