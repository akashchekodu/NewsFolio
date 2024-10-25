"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { useSearch } from "../context/SearchContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { setSearchTerm } = useSearch(); // Access setSearchTerm from context

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      setSearchTerm(event.target.value); // Update context state with search term
    }
  };

  const isDarkMode = theme === "dark";

  if (!isMounted) return null;

  return (
    <div
      className="w-full border-b border-b-slate-200 bg-white dark:border-b-slate-700"
      style={{
        backgroundColor: "var(--secondary-bg)",
        color: "var(--foreground)",
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-8">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Menu and Brand on the left */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4">
                  <Button variant="ghost" className="justify-start">
                    Login
                  </Button>
                  <Toggle
                    aria-label="Toggle dark mode"
                    pressed={isDarkMode}
                    onPressedChange={() =>
                      setTheme(isDarkMode ? "light" : "dark")
                    }
                    className="justify-start"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </Toggle>
                </div>
              </SheetContent>
            </Sheet>
            <a
              href="/"
              className="text-xl font-bold p-4"
              style={{ color: "var(--foreground)" }}
            >
              MyApp
            </a>
          </div>
        </div>

        {/* Search icon on the right in mobile view */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setIsSearchVisible(!isSearchVisible)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Toggle search</span>
        </Button>

        <div className="hidden md:flex md:items-center md:space-x-4">
          <Input
            type="search"
            placeholder="Search..."
            onKeyDown={handleSearchKeyPress}
            className="w-[200px] md:w-[300px]"
            style={{
              backgroundColor: "var(--input)",
              color: "var(--foreground)",
            }}
          />
          <Button
            variant="ghost"
            className="text-slate-700 dark:text-slate-400"
            style={{
              backgroundColor: "var(--primary-foreground)",
              color: "",
            }}
          >
            Login
          </Button>
          <Toggle
            aria-label="Toggle dark mode"
            pressed={isDarkMode}
            onPressedChange={() => setTheme(isDarkMode ? "light" : "dark")}
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--foreground)",
            }}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Toggle>
        </div>
      </div>

      {isSearchVisible && (
        <div
          className="border-t border-slate-200 p-2 dark:border-slate-700"
          style={{ backgroundColor: "var(--card)" }}
        >
          <Input
            type="search"
            placeholder="Search..."
            onKeyDown={handleSearchKeyPress}
            className="w-full"
            style={{
              backgroundColor: "var(--input)",
              color: "var(--foreground)",
            }}
          />
        </div>
      )}
    </div>
  );
}
