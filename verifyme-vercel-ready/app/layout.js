import './globals.css';

export const metadata = {
  title: 'VerifyMe — Gaming & College Help Services',
  description: 'Personal services for gaming and college support requests.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
