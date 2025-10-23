import { Redis } from '@upstash/redis';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        console.log('=== TEST REDIS ===');
        console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL);
        console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Défini' : 'NON DÉFINI');

        // Test 1: Ping
        const pingResult = await redis.ping();
        console.log('✅ PING:', pingResult);

        // Test 2: Set
        const testKey = 'test:' + Date.now();
        await redis.set(testKey, 'Hello Redis!');
        console.log('✅ SET:', testKey);

        // Test 3: Get
        const value = await redis.get(testKey);
        console.log('✅ GET:', value);

        // Test 4: Delete
        await redis.del(testKey);
        console.log('✅ DEL:', testKey);

        // Test 5: Lister les clés
        const keys = await redis.keys('*');
        console.log('✅ KEYS:', keys);

        return new Response(JSON.stringify({
            success: true,
            ping: pingResult,
            test: value,
            existingKeys: keys,
            env: {
                url: process.env.UPSTASH_REDIS_REST_URL,
                tokenDefined: !!process.env.UPSTASH_REDIS_REST_TOKEN
            }
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error('❌ ERREUR REDIS:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
