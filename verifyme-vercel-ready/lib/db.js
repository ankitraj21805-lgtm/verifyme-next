import { neon } from '@neondatabase/serverless';

let sqlClient = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add Neon connection string in Vercel Environment Variables.');
  }
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export const fallbackServices = [
  { id: 1, title: 'Live Tournament Registration', description: 'Help with tournament registration and basic participant details.', category: 'Gaming', price: 'Starting ₹49' },
  { id: 2, title: 'Game ID Related Help', description: 'Game UID/profile setup guidance and official support guidance.', category: 'Gaming', price: 'Starting ₹49' },
  { id: 3, title: 'Gaming Thumbnail Design', description: 'Clean thumbnails for YouTube, reels, shorts, and live streams.', category: 'Gaming', price: 'Starting ₹99' },
  { id: 4, title: 'Gaming Logo Design', description: 'Gaming logo, clan logo, and profile branding design.', category: 'Gaming', price: 'Starting ₹199' },
  { id: 5, title: 'No Dues Form Help', description: 'Guidance and support for no dues form process.', category: 'College', price: 'Starting ₹49' },
  { id: 6, title: 'Back Paper Form Help', description: 'Support for back paper form filling and forwarding guidance.', category: 'College', price: 'Starting ₹99' },
  { id: 7, title: 'Exam Form Forwarding Help', description: 'Exam form checking, formatting, and forwarding support.', category: 'College', price: 'Starting ₹99' },
  { id: 8, title: 'Personal College Query Help', description: 'Support for college-related form/process questions.', category: 'College', price: 'Starting ₹49' },
];
