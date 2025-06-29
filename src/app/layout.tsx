import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StructuredData } from "@/components/ui/StructuredData";

export const metadata: Metadata = {
  title: "Cremería Raíz - Productos Lácteos Artesanales de Calidad",
  description: "Disfruta de quesos, yogures y productos lácteos frescos, naturales y artesanales en Cremería Raíz. Sabor auténtico, tradición mexicana y calidad garantizada. ¡Conoce nuestra variedad y haz tu pedido!",
  keywords: [
    "cremería",
    "quesos artesanales",
    "productos lácteos",
    "yogur natural",
    "crema fresca",
    "productos mexicanos",
    "lácteos artesanales",
    "Raíz",
    "sabor tradicional"
  ],
  authors: [{ name: "Cremería Raíz" }],
  creator: "Cremería Raíz",
  publisher: "Cremería Raíz",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  metadataBase: new URL('https://cremeria-raiz.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Cremería Raíz - Productos Lácteos Artesanales de Calidad",
    description: "Quesos, yogures y más, hechos con pasión y tradición mexicana. Calidad y frescura en cada producto.",
    url: 'https://cremeria-raiz.com',
    siteName: 'Cremería Raíz',
    images: [
      {
        url: '/images/queso.jpg',
        width: 1200,
        height: 630,
        alt: 'Cremería Raíz - Quesos Artesanales',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cremería Raíz - Productos Lácteos Artesanales de Calidad",
    description: "Quesos, yogures y más, hechos con pasión y tradición mexicana.",
    images: ['/images/queso.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <StructuredData />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
