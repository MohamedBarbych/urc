import { db } from '@vercel/postgres';
import { verifySession } from '../lib/session';

export const config = {
    runtime: 'edge',
};

/**
 * Gestionnaire de salons de discussion
 * Je récupère la liste des salons disponibles
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
        const client = await db.connect();
        const { rows } = await client.sql`
            SELECT id, name, description 
            FROM rooms 
            ORDER BY name
        `;

        return new Response(JSON.stringify({
            success: true,
            rooms: rows
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
