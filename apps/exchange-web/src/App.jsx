import { useState, useEffect } from 'react';
import './App.css';

const API_ORDERS  = '/api/orders';
const API_MARKET  = '/api/market/summary';

function App() {
  const [prices, setPrices]   = useState([]);
  const [orders, setOrders]   = useState([]);
  const [form, setForm]       = useState({ type: 'BUY', asset: 'BTC', quantity: '' });
  const [message, setMessage] = useState('');

  // Poll market prices every 5s
  useEffect(() => {
    const fetchPrices = () =>
      fetch(API_MARKET).then(r => r.json()).then(setPrices).catch(console.error);
    fetchPrices();
    const timer = setInterval(fetchPrices, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () =>
    fetch(API_ORDERS).then(r => r.json()).then(setOrders).catch(console.error);

  const placeOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: form.type, asset: form.asset, quantity: Number(form.quantity) }),
      });
      const order = await res.json();
      setMessage(`✅ Order placed! ID: ${order.id} | Price: ${order.price?.toLocaleString()} KRW`);
      fetchOrders();
    } catch (err) {
      setMessage('❌ Failed to place order. Is trading-service running?');
    }
  };

  const cancelOrder = async (id) => {
    await fetch(`${API_ORDERS}/${id}/cancel`, { method: 'PATCH' });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  const statusColor = { PENDING: '#f59e0b', FILLED: '#10b981', CANCELLED: '#ef4444' };

  return (
    <div className="app">
      <header>
        <h1>🏦 Hangang Exchange</h1>
        <span className="subtitle">Real-time Crypto Trading</span>
      </header>

      <div className="grid">
        {/* ── Market Prices Panel ── */}
        <section className="card market-panel">
          <h2>📈 Market Prices</h2>
          {prices.length === 0
            ? <p className="muted">Loading prices... (Is market-service running?)</p>
            : prices.map(p => (
              <div className="price-row" key={p.asset}>
                <span className="asset">{p.asset}</span>
                <span className="price">{p.price?.toLocaleString()} KRW</span>
                <span className={`change ${p.change24h >= 0 ? 'up' : 'down'}`}>
                  {p.change24h >= 0 ? '▲' : '▼'} {Math.abs(p.change24h)}%
                </span>
                <span className="volume">Vol: {p.volume24h?.toLocaleString()}</span>
              </div>
            ))
          }
        </section>

        {/* ── Order Form ── */}
        <section className="card order-panel">
          <h2>📝 Place Order</h2>
          <p className="muted">Price is automatically fetched from Market Service</p>
          <form onSubmit={placeOrder}>
            <label>Type
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </label>
            <label>Asset
              <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })}>
                {prices.map(p => <option key={p.asset} value={p.asset}>{p.asset}</option>)}
                {prices.length === 0 && <><option value="BTC">BTC</option><option value="ETH">ETH</option></>}
              </select>
            </label>
            <label>Quantity
              <input
                type="number" min="0" step="0.0001"
                placeholder="e.g. 0.1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </label>
            <button type="submit">Place Order</button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>
      </div>

      {/* ── Order History ── */}
      <section className="card order-history">
        <h2>📋 My Orders</h2>
        {orders.length === 0
          ? <p className="muted">No orders yet.</p>
          : <table>
            <thead>
              <tr><th>ID</th><th>Type</th><th>Asset</th><th>Qty</th><th>Price (KRW)</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {[...orders].reverse().map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td className={o.type === 'BUY' ? 'buy' : 'sell'}>{o.type}</td>
                  <td>{o.asset}</td>
                  <td>{o.quantity}</td>
                  <td>{o.price?.toLocaleString()}</td>
                  <td><span style={{ color: statusColor[o.status] }}>{o.status}</span></td>
                  <td>
                    {o.status === 'PENDING' && (
                      <button className="btn-cancel" onClick={() => cancelOrder(o.id)}>Cancel</button>
                    )}
                    <button className="btn-delete" onClick={() => deleteOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </section>
    </div>
  );
}

export default App;
