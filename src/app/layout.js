import './globals.css';
import ClientLayout from './ClientLayout';
import prisma from '../lib/prisma';

export const metadata = {
  title: 'Magpie Magique — Cocktails & Ambiance | Montréal',
  description: 'Nouveau bar à cocktail sur le Plateau, inspiré par les bars d’hôtel mythiques à travers le monde.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
};

export const revalidate = 0;

export default async function RootLayout({ children }) {
  let logoUrl = '/assets/logo.svg';
  let siteContents = [];
  try {
    const logoImage = await prisma.siteImage.findUnique({
      where: { key: 'logo' },
      include: { photo: true }
    });
    if (logoImage?.photo?.url) {
      logoUrl = logoImage.photo.url;
    }
  } catch (err) {
    console.error('Failed to load site logo:', err);
  }

  try {
    siteContents = await prisma.siteContent.findMany();
  } catch (err) {
    console.error('Failed to load site contents:', err);
  }

  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cinzel:wght@400;600;700;800&family=Outfit:wght@400;500;600;700&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href={logoUrl} />
      </head>
      <body>
        <ClientLayout logoUrl={logoUrl} siteContents={siteContents}>{children}</ClientLayout>
      </body>
    </html>
  );
}
