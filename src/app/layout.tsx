import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CreatorHub - YouTube Creator Platform",
    template: "%s | CreatorHub",
  },
  description:
    "All-in-one platform for YouTube creators. Generate scripts, create thumbnails, optimize SEO, and grow your channel faster with AI.",
  keywords: [
    "YouTube",
    "creator",
    "content creation",
    "video scripts",
    "thumbnails",
    "SEO",
    "AI tools",
  ],
  authors: [{ name: "CreatorHub" }],
  creator: "CreatorHub",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CreatorHub",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://creatorhub.app",
    siteName: "CreatorHub",
    title: "CreatorHub - YouTube Creator Platform",
    description:
      "All-in-one platform for YouTube creators. Generate scripts, create thumbnails, optimize SEO, and grow your channel faster with AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorHub - YouTube Creator Platform",
    description:
      "All-in-one platform for YouTube creators. Generate scripts, create thumbnails, optimize SEO, and grow your channel faster with AI.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className="font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
}
