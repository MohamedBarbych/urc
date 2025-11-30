const express = require('express');
const cors = require('cors');
const { createClient } = require('@vercel/postgres');
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Utilitaires de hash
function stringToArrayBuffer(str) {
  return Buffer.from(str, 'utf-8');
}

function arrayBufferToBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}

// Middleware de vérification de session
async function verifySession(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }
  
  const user = await redis.get(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expirée' });
  }
  
  req.user = user;
  req.token = token;
  next();
}

// API: Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis"
      });
    }

    const hash = crypto.createHash('sha256').update(username + password).digest('base64');
    const client = createClient();
    await client.connect();

    const { rowCount } = await client.sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `;

    if (rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Nom d'utilisateur ou email déjà utilisé"
      });
    }

    const externalId = crypto.randomUUID();
    const { rows } = await client.sql`
      INSERT INTO users (username, email, password, external_id, last_login, created_on)
      VALUES (${username}, ${email}, ${hash}, ${externalId}, NOW(), NOW())
      RETURNING user_id, username, email, external_id
    `;

    const newUser = rows[0];
    const token = crypto.randomUUID();
    const user = {
      id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      externalId: newUser.external_id
    };

    await redis.set(token, user, { ex: 3600 });
    await redis.hset("users", { [user.id]: user });

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(username + password).digest('base64');
    
    const client = createClient();
    await client.connect();

    const { rows, rowCount } = await client.sql`
      SELECT * FROM users WHERE username = ${username} AND password = ${hash}
    `;

    if (rowCount !== 1) {
      return res.status(401).json({
        success: false,
        message: "Identifiant ou mot de passe incorrect"
      });
    }

    await client.sql`UPDATE users SET last_login = NOW() WHERE user_id = ${rows[0].user_id}`;

    const token = crypto.randomUUID();
    const user = {
      id: rows[0].user_id,
      username: rows[0].username,
      email: rows[0].email,
      externalId: rows[0].external_id
    };

    await redis.set(token, user, { ex: 86400 });
    await redis.hset("users", { [user.id]: user });

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Users
app.get('/api/users', verifySession, async (req, res) => {
  try {
    const allUsers = await redis.hgetall('users');
    const users = Object.values(allUsers || {}).filter(u => u.id !== req.user.id);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Rooms
app.get('/api/rooms', verifySession, async (req, res) => {
  try {
    const client = createClient();
    await client.connect();
    const { rows } = await client.sql`SELECT id, name, description FROM rooms ORDER BY name`;
    res.json({ success: true, rooms: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Messages
app.get('/api/messages', verifySession, async (req, res) => {
  try {
    const userId = req.query.userId;
    const currentUserId = req.user.id;
    const key1 = `msg:${currentUserId}:${userId}`;
    const key2 = `msg:${userId}:${currentUserId}`;

    const [messages1, messages2] = await Promise.all([
      redis.lrange(key1, 0, -1),
      redis.lrange(key2, 0, -1)
    ]);

    const allMessages = [
      ...(messages1 || []).map(m => ({ ...m, sent: true })),
      ...(messages2 || []).map(m => ({ ...m, sent: false }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    res.json({ success: true, messages: allMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/messages', verifySession, async (req, res) => {
  try {
    const { userId, content } = req.body;
    const key = `msg:${req.user.id}:${userId}`;
    const message = { content, timestamp: Date.now() };
    
    await redis.rpush(key, message);
    await redis.expire(key, 60 * 60 * 24 * 7);
    
    res.json({ success: true, message: 'Message envoyé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Room Messages
app.get('/api/room-messages', verifySession, async (req, res) => {
  try {
    const roomId = req.query.roomId;
    const key = `room:${roomId}:messages`;
    const messages = await redis.lrange(key, 0, -1);
    res.json({ success: true, messages: messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/room-messages', verifySession, async (req, res) => {
  try {
    const { roomId, content } = req.body;
    const key = `room:${roomId}:messages`;
    const message = {
      senderId: req.user.id,
      senderUsername: req.user.username,
      roomId,
      content,
      timestamp: Date.now()
    };
    
    await redis.rpush(key, message);
    await redis.expire(key, 60 * 60 * 24 * 7);
    
    res.json({ success: true, message: 'Message envoyé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Backend API démarré sur le port ${PORT}`);
});
