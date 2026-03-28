import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import { FlyAnimationLayer } from "@/components/fly-animation-layer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NicheOutreach - YouTube Influencer Matching",
  description: "AI-driven YouTube niche influencer matching platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        <Providers>
          <NavBar />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <FlyAnimationLayer />
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: "glass-tooltip !text-foreground !text-sm",
              style: {
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                background: "rgba(255, 255, 255, 0.92)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
