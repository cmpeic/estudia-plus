import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Estudia+ · Preparación de examen",
  description:
    "App interactiva para estudiar: Direcciones IP, Arquitectura de Software, Entornos, UML, Usabilidad y Quishing. Lecciones, diagramas, laboratorios, tarjetas y simulacros.",
  applicationName: "Estudia+",
  appleWebApp: { capable: true, title: "Estudia+", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

// Aplica el tema antes del primer pintado (sin parpadeo)
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-2xl pb-32">{children}</div>
        <BottomNav />
        <ServiceWorker />
      </body>
    </html>
  );
}
