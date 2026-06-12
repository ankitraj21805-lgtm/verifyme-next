async function getOrder(orderId, phone) {
  if (!orderId) return null;
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const qs = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const res = await fetch(`${base}/api/orders/${orderId}${qs}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

function StatusBadge({ label }) {
  return <span className="pill" style={{ borderColor: '#8b5cf6', color: '#ddd6fe' }}>{label}</span>;
}

export default async function OrderSuccessPage({ searchParams }) {
  const orderId = searchParams?.orderId || '';
  const phone = searchParams?.phone || '';
  const data = await getOrder(orderId, phone);
  const order = data?.order;

  return <main className="admin-shell">
    <div className="panel card">
      <span className="badge">Order Submitted Successfully</span>
      <h1>Thank you! Your VerifyMe order is received.</h1>
      {!order ? <p className="notice">Order submitted, but details could not be loaded right now. Save your Order ID: <b>#{orderId}</b></p> : <>
        <div className="grid" style={{ marginTop: 18 }}>
          <div className="card"><h3>Order ID</h3><h2>#{order.id}</h2></div>
          <div className="card"><h3>Order Status</h3><h2><StatusBadge label={order.status} /></h2></div>
          <div className="card"><h3>Payment Status</h3><h2><StatusBadge label={order.payment_status || 'NOT_SUBMITTED'} /></h2></div>
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <h2>{order.service_title}</h2>
          <p><b>Category:</b> {order.service_category}</p>
          <p><b>Price:</b> {order.service_price}</p>
          {order.project_details && <p><b>Your Details:</b> {order.project_details}</p>}
        </div>
      </>}
      <p className="notice">Save your Order ID. You can track your order anytime using Order ID + WhatsApp number.</p>
      <div className="actions">
        <a className="btn" href={`/payment?orderId=${orderId}`}>Submit Payment Reference</a>
        <a className="btn secondary" href={`/track?orderId=${orderId}`}>Track Order</a>
        <a className="btn secondary" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919244076460'}?text=${encodeURIComponent(`Hi VerifyMe, my order ID is #${orderId}. Please confirm my order.`)}`}>Confirm on WhatsApp</a>
        <a className="btn secondary" href="/">Back Home</a>
      </div>
    </div>
  </main>;
}
