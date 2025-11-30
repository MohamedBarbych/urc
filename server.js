const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@vercel/postgres');
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function verifySession(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Non autorisé' });
  const user = await redis.get(token);
  if (!user) return res.status(401).json({ success: false, message: 'Session expirée' });
  req.user = user;
  req.token = token;
  next();
}

app.post('/api/register', async (req, res) => {
  const client = createClient();
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
    }
    const hash = crypto.createHash('sha256').update(username + password).digest('base64');
    await client.connect();
    const check = await client.sql`SELECT * FROM users WHERE username = ${username} OR email = ${email}`;
    if (check.rowCount > 0) {
      await client.end();
      return res.status(409).json({ success: false, message: "Nom d'utilisateur ou email déjà utilisé" });
    }
    const externalId = crypto.randomUUID();
    const result = await client.sql`INSERT INTO users (username, email, password, external_id, last_login, created_on) VALUES (${username}, ${email}, ${hash}, ${externalId}, NOW(), NOW()) RETURNING user_id, username, email, external_id`;
    await client.end();
    const token = crypto.randomUUID();
    const user = { id: result.rows[0].user_id, username: result.rows[0].username, email: result.rows[0].email, externalId: result.rows[0].external_id };
    await redis.set(token, user, { ex: 3600 });
    await redis.hset("users", { [user.id]: user });
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    try { await client.end(); } catch {}
    console.error('Erreur register:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const client = createClient();
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Identifiant et mot de passe requis" });
    }
    const hash = crypto.createHash('sha256').update(username + password).digest('base64');
    await client.connect();
    const result = await client.sql`SELECT * FROM users WHERE username = ${username} AND password = ${hash}`;
    if (result.rowCount !== 1) {
      await client.end();
      return res.status(401).json({ success: false, message: "Identifiant ou mot de passe incorrect" });
    }
    await client.sql`UPDATE users SET last_login = NOW() WHERE user_id = ${result.rows[0].user_id}`;
    await client.end();
    const token = crypto.randomUUID();
    const user = { id: result.rows[0].user_id, username: result.rows[0].username, email: result.rows[0].email, externalId: result.rows[0].external_id };
    await redis.set(token, user, { ex: 86400 });
    await redis.hset("users", { [user.id]: user });
    res.json({ success: true, token, user });
  } catch (error) {
    try { await client.end(); } catch {}
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/users', verifySession, async (req, res) => {
  try {
    const allUsers = await redis.hgetall('users');
    const users = Object.values(allUsers || {})
      .filter(u => u.id !== req.user.id)
      .map(u => ({ ...u, user_id: u.id })); // Ajouter user_id pour compatibilité frontend
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/rooms', verifySession, async (req, res) => {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.sql`SELECT room_id as id, name FROM rooms ORDER BY name`;
    await client.end();
    const rooms = result.rows.map(r => ({ ...r, room_id: r.id })); // Ajouter room_id pour compatibilité
    res.json({ success: true, rooms });
  } catch (error) {
    try { await client.end(); } catch {}
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages', verifySession, async (req, res) => {
  try {
    const { otherUserId } = req.query;
    if (!otherUserId) return res.status(400).json({ success: false, message: 'otherUserId requis' });
    const key1 = `msg:${req.user.id}:${otherUserId}`;
    const key2 = `msg:${otherUserId}:${req.user.id}`;
    const [msgs1, msgs2] = await Promise.all([redis.lrange(key1, 0, -1), redis.lrange(key2, 0, -1)]);
    const allMessages = [...(msgs1 || []), ...(msgs2 || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json({ success: true, messages: allMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/messages', verifySession, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ success: false, message: 'receiverId et content requis' });
    const message = { senderId: req.user.id, senderUsername: req.user.username, receiverId, content, timestamp: new Date().toISOString() };
    const key = `msg:${req.user.id}:${receiverId}`;
    await redis.rpush(key, message);
    await redis.expire(key, 604800);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/room-messages', verifySession, async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId requis' });
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
    if (!roomId || !content) return res.status(400).json({ success: false, message: 'roomId et content requis' });
    const message = { senderId: req.user.id, senderUsername: req.user.username, roomId, content, timestamp: new Date().toISOString() };
    const key = `room:${roomId}:messages`;
    await redis.rpush(key, message);
    await redis.expire(key, 604800);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use((req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Serveur démarré sur le port ${PORT}`);
  console.log(`  - Frontend React : http://localhost:${PORT}`);
  console.log(`  - Backend API : http://localhost:${PORT}/api/*`);
});