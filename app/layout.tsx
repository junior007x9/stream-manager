import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importe o componente que criamos
import InstallPWA from "@/components/InstallPWA";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stream Manager",
  description: "Gerencie suas assinaturas",
  manifest: "/manifest.json", // Link para o manifesto
};

// Configuração para parecer App Nativo (sem barra de navegador)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impede zoom para parecer app nativo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <InstallPWA /> {/* O aviso aparecerá em todas as telas */}
      </body>
    </html>
  );
}