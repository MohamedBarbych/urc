import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, email, password } = await request.json();

        // Validation des données
        if (!username || !email || !password) {
            return new Response(JSON.stringify({
                code: "INVALID_DATA",
                message: "Tous les champs sont requis"
            }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Hash du mot de passe
        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();

        // Vérifier si l'utilisateur existe déjà
        const { rowCount: existingUsers } = await client.sql`
            select * from users where username = ${username} or email = ${email}
        `;

        if (existingUsers > 0) {
            return new Response(JSON.stringify({
                code: "USER_EXISTS",
                message: "Nom d'utilisateur ou email déjà utilisé"
            }), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Créer un external_id pour Pusher Beams
        const externalId = crypto.randomUUID().toString();

        // Insérer le nouvel utilisateur
        const { rows } = await client.sql`
            insert into users (username, email, password, external_id, last_login, created_on)
            values (${username}, ${email}, ${hashed64}, ${externalId}, now(), now())
            returning user_id, username, email, external_id
        `;

        if (rows.length === 0) {
            throw new Error("Erreur lors de la création de l'utilisateur");
        }

        const newUser = rows[0];

        // Créer un token de session
        const token = crypto.randomUUID().toString();
        const user = {
            id: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            externalId: newUser.external_id
        };

        // Stocker le token dans Redis
        await redis.set(token, user, { ex: 3600 });

        // Ajouter l'utilisateur à la liste des utilisateurs dans Redis
        const userInfo = {};
        userInfo[user.id] = user;
        await redis.hset("users", userInfo);

        return new Response(JSON.stringify({
            token: token,
            user: {
                id: newUser.user_id,
                username: newUser.username,
                email: newUser.email
            }
        }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            code: "INTERNAL_ERROR",
            message: error.message || "Erreur lors de l'inscription"
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
