import TrackOrderForm from '../ui/TrackOrderForm';

export const dynamic = 'force-dynamic';

export default function TrackPage({ searchParams }) {
  const orderId = searchParams?.orderId || '';

  return (
    <main className="admin-shell">
      <div className="panel card">
        <span className="badge">Customer Order Tracking</span>
        <h1>Track Your VerifyMe Order</h1>
        <p className="notice">
          Enter your Order ID and the same WhatsApp number used while placing the order. You will see your order status, payment status, and next steps.
        </p>
        <TrackOrderForm initialOrderId={orderId} />
        <div className="actions" style={{ marginTop: 18 }}>
          <a className="btn secondary" href="/">Back Home</a>
        </div>
      </div>
    </main>
  );
}
