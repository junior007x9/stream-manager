import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InstallPWA from "@/components/InstallPWA";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stream Manager",
  description: "Gerencie suas assinaturas de streaming (Netflix, HBO, Disney+).",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  // ISSO AQUI FAZ FICAR BONITO NO WHATSAPP
  openGraph: {
    title: "Stream Manager",
    description: "Acesse suas senhas e faturas dos streams.",
    url: "https://stream-manager-junior.vercel.app",
    siteName: "Stream Manager",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impede dar zoom (parece app nativo)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Garante compatibilidade com iOS antigo */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        {children}
        {/* O Robô de Instalação entra aqui */}
        <InstallPWA />
      </body>
    </html>
  );
}