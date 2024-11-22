"use client";

import { ThemeProvider } from "next-themes";
import { SearchProvider } from "./context/SearchContext";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/Navbar";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SearchProvider>
        <ThemeProvider attribute="class">
          <Navbar />
          {children}
        </ThemeProvider>
      </SearchProvider>
    </SessionProvider>
  );
}
