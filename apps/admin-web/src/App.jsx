import { useState, useEffect } from 'react';
import './App.css';

const API_PRICES = '/api/market/prices';
const API_ORDERS = '/api/orders';

function App() {
  const [tab, setTab]         = useState('market');
  const [prices, setPrices]   = useState([]);
  const [orders, setOrders]   = useState([]);
  const [editId, setEditId]   = useState(null);
  const [editVal, setEditVal] = useState({});
  const [newPrice, setNewPrice] = useState({ asset: '', price: '', change24h: '' });

  useEffect(() => { fetchPrices(); fetchOrders(); }, []);

  const fetchPrices = () =>
    fetch(API_PRICES).then(r => r.json()).then(setPrices).catch(console.error);

  const fetchOrders = () =>
    fetch(API_ORDERS).then(r => r.json()).then(setOrders).catch(console.error);

  // ── Market Price CRUD ──────────────────────────────────────
  const addPrice = async (e) => {
    e.preventDefault();
    await fetch(API_PRICES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPrice, price: Number(newPrice.price), change24h: Number(newPrice.change24h) }),
    });
    setNewPrice({ asset: '', price: '', change24h: '' });
    fetchPrices();
  };

  const startEdit = (p) => { setEditId(p.id); setEditVal({ price: p.price, change24h: p.change24h }); };

  const saveEdit = async (id) => {
    await fetch(`${API_PRICES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Number(editVal.price), change24h: Number(editVal.change24h) }),
    });
    setEditId(null);
    fetchPrices();
  };

  const deletePrice = async (id) => {
    await fetch(`${API_PRICES}/${id}`, { method: 'DELETE' });
    fetchPrices();
  };

  // ── Order Monitoring ───────────────────────────────────────
  const fillOrder   = async (id) => { await fetch(`${API_ORDERS}/${id}/fill`,   { method: 'PATCH' }); fetchOrders(); };
  const cancelOrder = async (id) => { await fetch(`${API_ORDERS}/${id}/cancel`, { method: 'PATCH' }); fetchOrders(); };
  const deleteOrder = async (id) => { await fetch(`${API_ORDERS}/${id}`,        { method: 'DELETE' }); fetchOrders(); };

  const statusColor = { PENDING: '#f59e0b', FILLED: '#10b981', CANCELLED: '#ef4444' };

  return (
    <div className="app">
      <header>
        <h1>⚙️ Admin Dashboard</h1>
        <span className="subtitle">Hangang Exchange Operations</span>
      </header>

      <nav className="tabs">
        <button className={tab === 'market' ? 'active' : ''} onClick={() => setTab('market')}>📊 Market Management</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>📋 Order Monitoring</button>
      </nav>

      {/* ── TAB 1: Market Management ── */}
      {tab === 'market' && (
        <div>
          <section className="card">
            <h2>Add New Asset</h2>
            <form className="inline-form" onSubmit={addPrice}>
              <input placeholder="Asset (e.g. SOL)" value={newPrice.asset}
                onChange={e => setNewPrice({ ...newPrice, asset: e.target.value })} required />
              <input type="number" placeholder="Price (KRW)" value={newPrice.price}
                onChange={e => setNewPrice({ ...newPrice, price: e.target.value })} required />
              <input type="number" step="0.1" placeholder="24h Change %" value={newPrice.change24h}
                onChange={e => setNewPrice({ ...newPrice, change24h: e.target.value })} />
              <button type="submit">Add</button>
            </form>
          </section>

          <section className="card">
            <h2>Asset Prices</h2>
            <table>
              <thead>
                <tr><th>Asset</th><th>Price (KRW)</th><th>24h Change</th><th>Updated</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {prices.map(p => (
                  <tr key={p.id}>
                    <td className="asset-name">{p.asset}</td>
                    <td>
                      {editId === p.id
                        ? <input type="number" value={editVal.price} onChange={e => setEditVal({ ...editVal, price: e.target.value })} />
                        : p.price?.toLocaleString()
                      }
                    </td>
                    <td>
                      {editId === p.id
                        ? <input type="number" step="0.1" value={editVal.change24h} onChange={e => setEditVal({ ...editVal, change24h: e.target.value })} />
                        : <span className={p.change24h >= 0 ? 'up' : 'down'}>{p.change24h}%</span>
                      }
                    </td>
                    <td className="muted">{new Date(p.updatedAt).toLocaleTimeString()}</td>
                    <td>
                      {editId === p.id
                        ? <><button className="btn-save" onClick={() => saveEdit(p.id)}>Save</button>
                            <button className="btn-cancel-edit" onClick={() => setEditId(null)}>Cancel</button></>
                        : <><button className="btn-edit" onClick={() => startEdit(p)}>Edit</button>
                            <button className="btn-delete" onClick={() => deletePrice(p.id)}>Delete</button></>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* ── TAB 2: Order Monitoring ── */}
      {tab === 'orders' && (
        <section className="card">
          <h2>All Orders ({orders.length})</h2>
          <button className="btn-refresh" onClick={fetchOrders}>↻ Refresh</button>
          <table>
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
                    {o.status === 'PENDING' && <>
                      <button className="btn-fill" onClick={() => fillOrder(o.id)}>Fill</button>
                      <button className="btn-cancel-order" onClick={() => cancelOrder(o.id)}>Cancel</button>
                    </>}
                    <button className="btn-delete" onClick={() => deleteOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default App;
