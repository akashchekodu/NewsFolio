// /news

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
import Head from "next/head";

function NewsComponent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { setSearchTerm, setSearch } = useSearch(); // Access setSearchTerm from context
  const limit = 12;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSearchTerm("");
    setSearch("");
  }, []);

  useEffect(() => {
    const handleMediaChange = (e) => setIsMobile(e.matches);

    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");

      // Set the initial state
      setIsMobile(mediaQuery.matches);

      // Add listener
      mediaQuery.addEventListener("change", handleMediaChange);

      // Cleanup listener on unmount
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({ page, limit }).toString();

      try {
        const response = await fetch(`/api/news?${queryParams}`);
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
    const maxPagesToShow = 4; // Maximum number of page links to show
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2)); // Center current page
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if the end exceeds total pages
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page
    if (startPage > 1) {
      range.push(1);
      if (startPage > 2) {
        range.push("..."); // Add ellipsis if there's a gap
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        range.push("..."); // Add ellipsis if there's a gap
      }
      range.push(totalPages);
    }

    return range;
  };

  if (!isMounted) {
    return (
      <>
        <Head>
          <title>Latest News - NewsFolio</title>
          <meta
            name="description"
            content="Stay updated with the latest financial news."
          />
        </Head>

        <div className="grid gap-3">
          <div className="flex items-center justify-center h-screen">
            <svg
              className="animate-spin border-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              width="76"
              height="75"
              viewBox="0 0 76 75"
              fill="none"
            >
              <g id="Group 1000003700">
                <circle
                  id="Ellipse 715"
                  cx="38.0004"
                  cy="37.1953"
                  r="28"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <path
                  id="Ellipse 716"
                  d="M49.8079 62.5848C53.142 61.0342 56.138 58.842 58.6248 56.1335C61.1117 53.425 63.0407 50.2532 64.3018 46.7992C65.5629 43.3452 66.1313 39.6767 65.9745 36.003C65.8178 32.3293 64.939 28.7225 63.3884 25.3884C61.8378 22.0544 59.6456 19.0584 56.9371 16.5715C54.2286 14.0847 51.0568 12.1556 47.6028 10.8946C44.1488 9.63351 40.4802 9.06511 36.8066 9.22183C33.1329 9.37855 29.5261 10.2573 26.192 11.808"
                  stroke="url(#paint0_linear_13416_7443)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_13416_7443"
                  x1="0.803595"
                  y1="23.6159"
                  x2="24.4195"
                  y2="74.3928"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4F46E5" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>Latest News - NewsFolio</title>
        <meta
          name="description"
          content="Stay updated with the latest financial news."
        />
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-center p-4">Latest News</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-2xl mx-auto p-4">
            {Array.from({ length: limit }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <NewsGrid articles={articles} />
        )}

        {!loading && (
          <div className="p-4">
            <div className="pagination-container">
              {" "}
              {/* Add this wrapper */}
              <Pagination>
                <PaginationContent>
                  {!isMobile && page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => handlePageChange(page - 1)}
                      />
                    </PaginationItem>
                  )}
                  {getPaginationRange().map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      {typeof pageNumber === "number" ? (
                        <PaginationLink
                          href="#"
                          isActive={page === pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      ) : (
                        <span className="px-2">...</span> // Display ellipsis
                      )}
                    </PaginationItem>
                  ))}
                  {!isMobile && page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() => handlePageChange(page + 1)}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NewsComponent;
