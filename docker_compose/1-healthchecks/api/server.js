const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/materias', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, type, description, effect FROM materias ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch materias' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
