// layout.js

"use client";

import Head from "next/head";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "next-themes";
import { SearchProvider } from "./context/SearchContext";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="description" content="Finance News Aggregator" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NewsFolio</title>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <SearchProvider>
            <ThemeProvider attribute="class">
              <Navbar />
              {children}
            </ThemeProvider>
          </SearchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
