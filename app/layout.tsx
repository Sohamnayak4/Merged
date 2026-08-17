import type { Metadata } from "next";
import { Familjen_Grotesk, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteUrl } from "@/lib/site";

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const description =
  "A leaderboard for open source, ranked by the patches other maintainers merged — not by stars on your own projects.";

export const metadata: Metadata = {
  // Open Graph tags must be absolute, and every generated card resolves
  // against this. Without it, share previews break the moment the site isn't
  // on localhost.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "MERGED. — the open-source showcase",
    template: "%s",
  },
  description,
  applicationName: "MERGED.",
  openGraph: {
    type: "website",
    siteName: "MERGED.",
    url: siteUrl(),
    title: "MERGED. — the open-source showcase",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "MERGED. — the open-source showcase",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${familjen.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
