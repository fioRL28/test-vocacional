import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test Vocacional Adaptativo",
  description:
    "Sistema web inteligente para recomendación de perfiles vocacionales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      translate="no"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
