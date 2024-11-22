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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { setSearchTerm, setSearch } = useSearch();
  const limit = 12;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setSearchTerm("");
    setSearch("");
  }, []);

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center pt-4">Latest News</h1>

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
                      <span className="px-2">...</span>
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
  );
}

export default NewsComponent;
