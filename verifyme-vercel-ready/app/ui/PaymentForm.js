'use client';
import { useState } from 'react';
export default function PaymentForm({ orderId }) {
  const [done,setDone]=useState(false); const [error,setError]=useState('');
  async function submit(e){e.preventDefault(); setError(''); const data=Object.fromEntries(new FormData(e.currentTarget)); const res=await fetch('/api/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); const json=await res.json(); if(!res.ok){setError(json.error||'Failed');return;} setDone(true)}
  if(done) return <div className="notice">Payment reference submitted. Admin will verify soon.</div>;
  return <form className="form" onSubmit={submit}><input className="input" name="order_id" defaultValue={orderId} placeholder="Order ID" required/><input className="input" name="reference_id" placeholder="UPI / PhonePe / Paytm Reference ID" required/><input className="input" name="screenshot_url" placeholder="Screenshot URL optional"/><button className="btn">Submit Payment Reference</button>{error&&<p style={{color:'#f87171'}}>{error}</p>}</form>
}
