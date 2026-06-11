import PaymentForm from '../ui/PaymentForm';

export default function PaymentPage({ searchParams }) {
  const orderId = searchParams?.orderId || '';
  return <main className="admin-shell"><div className="panel card"><h1>Payment Reference</h1><p>Pay using UPI / PhonePe / Paytm and submit your reference ID.</p><p className="notice">UPI ID: <b>{process.env.NEXT_PUBLIC_UPI_ID || 'war0001@ptyes'}</b></p><PaymentForm orderId={orderId}/><p><a href="/">Back to home</a></p></div></main>;
}
