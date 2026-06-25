import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Gerencial · Agrícola Valles del Maule",
  description: "Gestión financiera y operativa — Agrícola Valles del Maule",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-6 py-8 md:px-10 max-w-[1400px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
