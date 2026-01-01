import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Match-Auto | 1000x Performance",
    description: "Marketplace Global de Vehículos y Servicios",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
