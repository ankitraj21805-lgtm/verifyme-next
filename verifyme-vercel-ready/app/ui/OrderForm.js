'use client';
import { useState } from 'react';

export default function OrderForm({ services }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(json.error || 'Order submit failed');
        return;
      }
      const phone = encodeURIComponent(data.client_whatsapp || '');
      window.location.href = `/order-success?orderId=${json.order.id}&phone=${phone}`;
    } catch (err) {
      setLoading(false);
      setError('Network error. Please try again or contact on WhatsApp.');
    }
  }

  return <form className="card form" onSubmit={submit}>
    <input className="input" name="client_name" placeholder="Full Name" required />
    <input className="input" name="client_whatsapp" placeholder="WhatsApp Number" required />
    <input className="input" type="email" name="client_email" placeholder="Email optional but recommended for confirmation" />
    <select className="select" name="service_id" required>
      <option value="">Select Service</option>
      {services.map(s => <option key={s.id} value={s.id}>{s.category} — {s.title} ({s.price})</option>)}
    </select>
    <textarea className="textarea" name="project_details" placeholder="Work details, deadline, budget, message" required />
    {error && <p style={{ color: '#f87171' }}>{error}</p>}
    <button className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Order'}</button>
    <small style={{ color: '#a1a1aa' }}>After submission you will get an Order ID, tracking page, and payment reference page.</small>
  </form>;
}
