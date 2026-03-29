import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Km314 Casas de Mar",
  description: "Casas seleccionadas dentro del barrio para disfrutar una estadía privada y cómoda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen bg-white text-gray-800">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
