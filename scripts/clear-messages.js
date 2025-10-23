// Script pour nettoyer les messages corrompus dans Redis
// Exécuter avec: node scripts/clear-messages.js

import { Redis } from '@upstash/redis';

// Charger les variables d'environnement
import { config } from 'dotenv';
config({ path: '.env.development.local' });

const redis = Redis.fromEnv();

async function clearMessages() {
    try {
        console.log('🔍 Recherche des conversations...');

        // Chercher toutes les clés de conversation
        const keys = await redis.keys('conversation:*');

        console.log(`📦 Trouvé ${keys.length} conversations`);

        if (keys.length === 0) {
            console.log('✅ Aucune conversation à supprimer');
            return;
        }

        // Supprimer toutes les clés
        for (const key of keys) {
            await redis.del(key);
            console.log(`🗑️  Supprimé: ${key}`);
        }

        console.log('✅ Toutes les conversations ont été supprimées !');
        console.log('💬 Vous pouvez maintenant envoyer de nouveaux messages');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

clearMessages();
