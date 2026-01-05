import type { Metadata } from "next";
import "./globals.css";
import { BeastModeOverlay } from "@/features/secret/BeastMode";
import { SpeedsterHandler } from "@/features/secret/SpeedsterWrapper";

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
            <body className="antialiased bg-black">
                <SpeedsterHandler />
                <BeastModeOverlay />
                {children}
            </body>
        </html>
    );
}
