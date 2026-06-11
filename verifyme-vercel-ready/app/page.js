import { getSql, fallbackServices } from '@/lib/db';
import OrderForm from './ui/OrderForm';

async function getServices() {
  try {
    const sql = getSql();
    return await sql`SELECT id, title, description, category, price FROM services ORDER BY id ASC`;
  } catch {
    return fallbackServices;
  }
}

export default async function HomePage() {
  const services = await getServices();
  const gaming = services.filter((s) => s.category === 'Gaming');
  const college = services.filter((s) => s.category === 'College');
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919244076460';
  return (
    <main>
      <nav className="nav"><div className="container nav-inner"><div className="brand">Verify<span>Me</span></div><div className="nav-links"><a href="#services">Services</a><a href="#order">Start Order</a><a href="/admin">Admin</a><a href={`https://wa.me/${wa}`}>WhatsApp</a></div></div></nav>
      <section className="hero"><div className="container"><span className="badge">Gaming • College Forms • Personal Help</span><h1>Your Personal Hub for Gaming & College Help</h1><p>Get support for live tournaments, game ID help, thumbnails, logos, no dues, back paper forms, exam form forwarding, and personal college queries — all in one place.</p><div className="actions"><a className="btn" href="#services">Explore Services</a><a className="btn secondary" href="#order">Start an Order</a><a className="btn secondary" href={`https://wa.me/${wa}`}>Chat on WhatsApp</a></div></div></section>
      <section id="services" className="section"><div className="container"><h2>Gaming Services</h2><div className="grid">{gaming.map((s)=><ServiceCard key={s.id} s={s}/>)}</div></div></section>
      <section className="section"><div className="container"><h2>College Services</h2><div className="grid">{college.map((s)=><ServiceCard key={s.id} s={s}/>)}</div></div></section>
      <section id="order" className="section"><div className="container two"><div><h2>Start Your Order</h2><p className="notice">This website is only for personal gaming and college help services. It is not a money transfer, KYC, remittance, wallet, or document-verification platform.</p><p>Fill your details, then submit payment reference on next page after paying through UPI/PhonePe/Paytm.</p></div><OrderForm services={services}/></div></section>
      <section className="section"><div className="container card"><h2>Payment Instructions</h2><p>Indian clients can pay using UPI / PhonePe / Paytm. UPI ID: <b>{process.env.NEXT_PUBLIC_UPI_ID || 'war0001@ptyes'}</b></p><p>Foreign clients should use an external licensed payment provider link only. Website records payment reference for services only.</p></div></section>
      <footer className="footer"><div className="container">Built for gaming creators, students, and personal service support. © VerifyMe</div></footer>
      <a className="whatsapp" href={`https://wa.me/${wa}`}>WhatsApp</a>
    </main>
  );
}

function ServiceCard({ s }) {return <div className="card"><span className="pill">{s.category}</span><h3>{s.title}</h3><p>{s.description}</p><div className="price">{s.price}</div><div className="actions"><a className="btn" href="#order">Order Now</a></div></div>}
