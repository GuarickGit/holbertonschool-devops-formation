const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});
redisClient.on('error', (err) => console.error('Redis error:', err.message));

const CACHE_KEY = 'materias';
const CACHE_TTL_SECONDS = 60;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/materias', async (req, res) => {
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      console.log('Serving materias from cache');
      return res.json(JSON.parse(cached));
    }

    console.log('Cache miss, querying database');
    const result = await pool.query('SELECT id, name, type, description, effect FROM materias ORDER BY id');

    await redisClient.setEx(CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (err) {
    console.error('Request failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch materias' });
  }
});

const PORT = process.env.PORT || 3000;

async function start() {
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
}

start();
