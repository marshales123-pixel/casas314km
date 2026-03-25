import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-800">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}