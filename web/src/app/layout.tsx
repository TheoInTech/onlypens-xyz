/* eslint-disable @next/next/no-page-custom-font */

// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";

import classes from "./layout.module.css";
import type { Metadata } from "next";
import meta from "@/lib/metadata.json";

import {
  Box,
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { theme } from "@/theme";
import { Menu, NProgress } from "@/components";
import { WalletProvider } from "@/providers/wallet.provider";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://onlypens.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: meta.longName,
    template: `%s - ${meta.longName}`,
  },
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.longName,
    description: meta.description,
    url: meta.url,
    siteName: meta.longName,
    locale: "en-US",
    type: "website",
    images: [
      {
        url: `/og-image.png`,
        width: 1920,
        height: 1080,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: meta.longName,
    card: "summary_large_image",
    description: meta.description,
    creator: "@theointech",
    images: [`/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon-16x16.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript suppressHydrationWarning />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <WalletProvider>
            <NProgress />
            <Menu />
            <Box component="main" className={classes.main}>
              <Box className={classes.wrapper}>{children}</Box>
            </Box>
          </WalletProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
