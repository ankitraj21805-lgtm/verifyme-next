'use client';
import { useEffect, useState } from 'react';

export default function TrackOrderForm({ initialOrderId = '' }) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  async function track(e) {
    if (e) e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError('');
    setData(null);
    const qs = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const res = await fetch(`/api/orders/${orderId}${qs}`, { cache: 'no-store' });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || 'Order not found');
      return;
    }
    setData(json);
  }

  useEffect(() => {
    if (initialOrderId) track();
  }, []);

  const order = data?.order;

  return <div className="card form">
    <form className="form" onSubmit={track}>
      <input className="input" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID" required />
      <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="WhatsApp Number for full details" />
      <button className="btn" disabled={loading}>{loading ? 'Checking...' : 'Track Order'}</button>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
    </form>

    {order && <div className="card" style={{ marginTop: 16 }}>
      <h2>Order #{order.id}</h2>
      <p><b>Service:</b> {order.service_title}</p>
      <p><b>Category:</b> {order.service_category}</p>
      <p><b>Order Status:</b> <span className="pill">{order.status}</span></p>
      <p><b>Payment Status:</b> <span className="pill">{order.payment_status || 'NOT_SUBMITTED'}</span></p>
      {data.limited && <p className="notice">Enter the same WhatsApp number used while ordering to view full details.</p>}
      {!data.limited && <>
        <p><b>Name:</b> {order.client_name}</p>
        <p><b>WhatsApp:</b> {order.client_whatsapp}</p>
        <p><b>Details:</b> {order.project_details}</p>
      </>}
      <div className="actions">
        <a className="btn secondary" href={`/payment?orderId=${order.id}`}>Submit Payment Reference</a>
        <a className="btn secondary" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919244076460'}`}>Contact Support</a>
      </div>
    </div>}
  </div>;
}
