import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/instrument-serif";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/cormorant/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const siteUrl = "https://waleedahmed.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Waleed Ahmed | Software Engineer & Product Builder",
  description:
    "Waleed Ahmed designs experiences, engineers systems, and obsesses over details. A software engineer and product builder based in Karachi, crafting products people remember.",
  keywords: [
    "Waleed Ahmed",
    "Software Engineer",
    "Product Builder",
    "Full Stack Developer",
    "Karachi",
    "Portfolio",
  ],
  authors: [{ name: "Waleed Ahmed", url: siteUrl }],
  creator: "Waleed Ahmed",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Waleed Ahmed | Software Engineer & Product Builder",
    description: "Crafting products people remember.",
    url: siteUrl,
    siteName: "Waleed Ahmed",
    images: [{ url: "/og", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waleed Ahmed | Software Engineer & Product Builder",
    description: "Crafting products people remember.",
    images: ["/og"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Waleed Ahmed",
      url: siteUrl,
      jobTitle: "Software Engineer & Product Builder",
      description: "Designs experiences, engineers systems, and obsesses over details.",
      address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
      sameAs: [
        "https://www.linkedin.com/in/",
        "https://github.com/",
        "https://www.instagram.com/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Waleed Ahmed",
      publisher: { "@id": `${siteUrl}/#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased selection:bg-accent-terracotta">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
