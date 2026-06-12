import PaymentForm from '../ui/PaymentForm';

export default function PaymentPage({ searchParams }) {
  const orderId = searchParams?.orderId || '';
  return <main className="admin-shell">
    <div className="panel card">
      <span className="badge">Payment Reference</span>
      <h1>Submit Payment Reference</h1>
      <p>Pay using UPI / PhonePe / Paytm and submit your reference ID.</p>
      <p className="notice">UPI ID: <b>{process.env.NEXT_PUBLIC_UPI_ID || 'war0001@ptyes'}</b></p>
      {orderId && <p>Your Order ID: <b>#{orderId}</b></p>}
      <PaymentForm orderId={orderId}/>
      <div className="actions">
        <a className="btn secondary" href={`/#customer-update`}>Check Order Update</a>
        <a className="btn secondary" href="/">Back to home</a>
      </div>
    </div>
  </main>;
}
