"use client";

import { useEffect, useState } from "react";
import NewsGrid from "./NewsGrid";
import SkeletonCard from "./SkeletonCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearch } from "../context/SearchContext";

function NewsComponent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { setSearchTerm, setSearch } = useSearch();
  const limit = 12;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setSearchTerm("");
    setSearch("");
  }, [setSearchTerm, setSearch]);

  useEffect(() => {
    const handleMediaChange = (e) => setIsMobile(e.matches);

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      try {
        const response = await fetch(`/api/news?${queryParams}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Origin": "https://newsfolio.vercel.app",        // Required if you're validating it server-side
    "Referer": "https://newsfolio.vercel.app/",      // Also optional, some backends check this
    "x-api-key": process.env.NEXT_PUBLIC_NEWS_API_KEY // Secure key if you're using API key validation
  },
});

        if (!response.ok) {
          throw new Error("Failed to fetch news articles");
        }

        const data = await response.json();

        setArticles(data.news);
        const totalArticles = data.totalArticles || 0;
        setTotalPages(Math.ceil(totalArticles / limit));
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPaginationRange = () => {
    const range = [];
    const maxPagesToShow = 4;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      range.push(1);
      if (startPage > 2) {
        range.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        range.push("...");
      }
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-4">Latest News</h1>

      <NewsGrid articles={articles} isLoading={loading} />

      {error && (
        <div className="text-red-500 text-center mt-4" role="alert">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <nav className="mt-8" aria-label="Pagination">
          <Pagination>
            <PaginationContent>
              {!isMobile && page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    aria-label="Go to previous page"
                  />
                </PaginationItem>
              )}
              {getPaginationRange().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {typeof pageNumber === "number" ? (
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber);
                      }}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={page === pageNumber ? "page" : undefined}
                    >
                      {pageNumber}
                    </PaginationLink>
                  ) : (
                    <span className="px-2" aria-hidden="true">
                      ...
                    </span>
                  )}
                </PaginationItem>
              ))}
              {!isMobile && page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    aria-label="Go to next page"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </nav>
      )}
    </div>
  );
}

export default NewsComponent;
