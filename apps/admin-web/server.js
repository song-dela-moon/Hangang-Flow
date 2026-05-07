const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const port = 8080;

// 1. 프록시 설정
const MARKET_URL  = 'http://market-service:9090';
const TRADING_URL = 'http://trading-service:8080';

const proxyRequest = (target) => (req, res) => {
  const url = target + req.originalUrl;
  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
  const proxyReq = http.request(url, {
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(500).send('Backend service unavailable');
  });
};

app.use('/api/market', proxyRequest(MARKET_URL));
app.use('/api/orders', proxyRequest(TRADING_URL));

// 2. 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Admin UI serving at http://localhost:${port}`);
  console.log(`Proxying /api/market to ${MARKET_URL}`);
  console.log(`Proxying /api/orders to ${TRADING_URL}`);
});
