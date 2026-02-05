import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Playfair_Display } from "next/font/google";
import Footer from "@/components/layout/footer";
import packageJson from "../../package.json";
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Repe - Workout Tracker",
  description: "Registra tus entrenamientos con elegancia. Una experiencia de seguimiento diseñada para quienes valoran la simplicidad y la eficacia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Repe",
  },
  openGraph: {
    title: "Repe - Workout Tracker",
    description: "Tu fuerza, sin complicaciones",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen pb-20">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <Footer version={packageJson.version} />
        </div>
      </body>
    </html>
  );
}
