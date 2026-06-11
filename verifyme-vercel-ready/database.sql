-- VerifyMe database schema for Neon/PostgreSQL
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Gaming', 'College')),
  price TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_whatsapp TEXT,
  project_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_references (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reference_id TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','RECEIVED','REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO services (title, description, category, price)
SELECT * FROM (VALUES
('Live Tournament Registration', 'Help with gaming tournament registration and basic participant details.', 'Gaming', 'Starting ₹49'),
('Live Tournament Management', 'Support for managing brackets, schedule, participants, and match coordination.', 'Gaming', 'Starting ₹199'),
('Game ID Related Help', 'Game UID/profile setup guidance, safe account settings, and official support guidance.', 'Gaming', 'Starting ₹49'),
('Gaming Thumbnail Design', 'Clean gaming thumbnails for YouTube, reels, shorts, and live streams.', 'Gaming', 'Starting ₹99'),
('Gaming Logo Design', 'Gaming logo, clan logo, and profile branding design.', 'Gaming', 'Starting ₹199'),
('Tournament Poster Design', 'Poster design for gaming tournaments and announcements.', 'Gaming', 'Starting ₹149'),
('No Dues Form Help', 'Guidance and support for no dues form process and basic forwarding help.', 'College', 'Starting ₹49'),
('Back Paper Form Help', 'Support for back paper form filling and forwarding guidance.', 'College', 'Starting ₹99'),
('Exam Form Forwarding Help', 'Help with exam form checking, formatting, and forwarding support with your permission.', 'College', 'Starting ₹99'),
('Personal College Query Help', 'Personal query support for college-related form/process questions.', 'College', 'Starting ₹49'),
('Document Formatting Help', 'Formatting support for assignments, project files, and college documents.', 'College', 'Starting ₹99'),
('PPT Presentation Design', 'Clean PPT design for college projects and presentations.', 'College', 'Starting ₹199')
) AS seed(title, description, category, price)
WHERE NOT EXISTS (SELECT 1 FROM services);
