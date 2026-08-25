import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agricore VetCare - Professional Veterinary Care',
  description: 'Providing professional, accessible veterinary care and authentic medicines for every farm in Bangladesh.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased font-sans">
        {children}
      </body>
    </html>
  );
}