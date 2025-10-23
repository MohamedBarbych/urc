import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session.js";

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const { rowCount, rows } = await sql`
            SELECT room_id, name, created_on, created_by
            FROM rooms
            ORDER BY name ASC
        `;

        console.log("Got " + rowCount + " rooms");

        if (rowCount === 0) {
            return new Response("[]", {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
