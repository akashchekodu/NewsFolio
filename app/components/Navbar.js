"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { useSearch } from "../context/SearchContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { setSearchTerm, setSearch, search } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";
  const isFeed = pathname === "/feed";
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";

  useEffect(() => {
    setIsMounted(true);
    setSearchTerm("");
    setSearch("");
  }, []);

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      setSearchTerm(search);
      router.push("/news/search");
    }
  };

  const handleLogOut = async () => {
    await signOut({ callbackUrl: "/news" });
  };

  const isDarkMode = theme === "dark";

  if (!isMounted) return null;

  return (
    <nav className="w-full border-b border-b-slate-200 bg-white dark:border-b-slate-700 dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {/*Removed extra close button*/}
                {!isAuthPage && !loggedIn && (
                  <SheetClose asChild>
                    <Link href="/auth">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Login
                      </Button>
                    </Link>
                  </SheetClose>
                )}
                {loggedIn && (
                  <>
                    {isFeed && (
                      <SheetClose asChild>
                        <Link href="/subscribe">
                          <Button className="w-full">Subscriptions</Button>
                        </Link>
                      </SheetClose>
                    )}
                    {isFeed && (
                      <SheetClose asChild>
                        <Link href="/news">
                          <Button className="w-full">Global News</Button>
                        </Link>
                      </SheetClose>
                    )}
                    {!isFeed && (
                      <SheetClose asChild>
                        <Link href="/feed">
                          <Button className="w-full">My Feed</Button>
                        </Link>
                      </SheetClose>
                    )}
                    <Button
                      className="w-full bg-red-600 text-white hover:bg-red-700"
                      onClick={handleLogOut}
                    >
                      Logout
                    </Button>
                  </>
                )}
                <Toggle
                  aria-label="Toggle dark mode"
                  pressed={isDarkMode}
                  onPressedChange={() =>
                    setTheme(isDarkMode ? "light" : "dark")
                  }
                  className="w-full justify-start bg-muted hover:bg-muted-foreground/10"
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
          <Link
            href={loggedIn && !isFeed ? "/feed" : "/news"}
            className="text-xl font-bold"
          >
            NewsFolio
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {!isAuthPage && (
            <div className="hidden lg:block">
              <Input
                type="search"
                placeholder="Search News"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-[200px] lg:w-[300px]"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Toggle search</span>
          </Button>
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {loggedIn && isFeed && (
              <Button>
                <Link href="/subscribe">Subscriptions</Link>
              </Button>
            )}
            {loggedIn && isFeed && (
              <Button>
                <Link href="/news">Global News</Link>
              </Button>
            )}
            {loggedIn && !isFeed && (
              <Button>
                <Link href="/feed">My Feed</Link>
              </Button>
            )}
            {!isAuthPage && !loggedIn && (
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/auth">Login</Link>
              </Button>
            )}
            {loggedIn && (
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogOut}
              >
                Logout
              </Button>
            )}
            <Toggle
              aria-label="Toggle dark mode"
              pressed={isDarkMode}
              onPressedChange={() => setTheme(isDarkMode ? "light" : "dark")}
              className="bg-muted hover:bg-muted-foreground/10"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Toggle>
          </div>
        </div>
      </div>

      {isSearchVisible && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-700 lg:hidden">
          <Input
            type="search"
            placeholder="Search News"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full"
          />
        </div>
      )}
    </nav>
  );
}
