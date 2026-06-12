'use client';
import { useState } from 'react';

export default function PaymentForm({ orderId }) {
  const [done, setDone] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(orderId || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || 'Failed');
      return;
    }
    setSubmittedOrderId(data.order_id);
    setDone(true);
  }

  if (done) return <div className="notice">
    <h3>Payment reference submitted ✅</h3>
    <p>Admin will verify it soon. Your payment status is currently <b>PENDING</b>.</p>
    <p>Order ID: <b>#{submittedOrderId}</b></p>
    <div className="actions"><a className="btn secondary" href="/#customer-update">Check Order Update</a></div>
  </div>;

  return <form className="form" onSubmit={submit}>
    <input className="input" name="order_id" defaultValue={orderId} placeholder="Order ID" required />
    <input className="input" name="reference_id" placeholder="UPI / PhonePe / Paytm Reference ID" required />
    <input className="input" name="screenshot_url" placeholder="Screenshot URL optional" />
    <button className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Payment Reference'}</button>
    {error && <p style={{ color: '#f87171' }}>{error}</p>}
  </form>;
}
