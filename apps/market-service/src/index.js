const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// CORS for exchange-web and admin-web
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── In-memory store ──────────────────────────────────────────
let prices = [
  { id: uuidv4(), asset: 'BTC', price: 90000000, change24h: 2.4,  updatedAt: new Date().toISOString() },
  { id: uuidv4(), asset: 'ETH', price: 5000000,  change24h: -1.2, updatedAt: new Date().toISOString() },
  { id: uuidv4(), asset: 'XRP', price: 800,       change24h: 0.8,  updatedAt: new Date().toISOString() },
];

let volumes = [
  { id: uuidv4(), asset: 'BTC', volume24h: 1200, updatedAt: new Date().toISOString() },
  { id: uuidv4(), asset: 'ETH', volume24h: 8500, updatedAt: new Date().toISOString() },
  { id: uuidv4(), asset: 'XRP', volume24h: 50000, updatedAt: new Date().toISOString() },
];

// ────────────────────────────────────────────────────────────
// CRUD: /api/market/prices
// ────────────────────────────────────────────────────────────

/** CREATE: POST /api/market/prices */
app.post('/api/market/prices', (req, res) => {
  const { asset, price, change24h = 0 } = req.body;
  if (!asset || price == null) {
    return res.status(400).json({ error: 'asset and price are required' });
  }
  const entry = { id: uuidv4(), asset, price, change24h, updatedAt: new Date().toISOString() };
  prices.push(entry);
  return res.status(201).json(entry);
});

/** READ (all): GET /api/market/prices */
app.get('/api/market/prices', (_req, res) => res.json(prices));

/** READ (one by asset): GET /api/market/prices/:asset */
app.get('/api/market/prices/:asset', (req, res) => {
  const entry = prices.find(p => p.asset.toUpperCase() === req.params.asset.toUpperCase());
  if (!entry) return res.status(404).json({ error: `Price for ${req.params.asset} not found` });
  return res.json(entry);
});

/** UPDATE: PUT /api/market/prices/:id */
app.put('/api/market/prices/:id', (req, res) => {
  const idx = prices.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  prices[idx] = { ...prices[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json(prices[idx]);
});

/** DELETE: DELETE /api/market/prices/:id */
app.delete('/api/market/prices/:id', (req, res) => {
  const before = prices.length;
  prices = prices.filter(p => p.id !== req.params.id);
  if (prices.length === before) return res.status(404).json({ error: 'Not found' });
  return res.status(204).send();
});

// ────────────────────────────────────────────────────────────
// READ: /api/market/summary  (market overview for exchange-web)
// ────────────────────────────────────────────────────────────
app.get('/api/market/summary', (_req, res) => {
  const summary = prices.map(p => {
    const vol = volumes.find(v => v.asset === p.asset);
    return { asset: p.asset, price: p.price, change24h: p.change24h, volume24h: vol ? vol.volume24h : 0 };
  });
  return res.json(summary);
});

// ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`[market-service] listening on :${PORT}`));
