// /news/search

"use client";
import { useEffect, useState } from "react";
import { useSearch } from "@/app/context/SearchContext";
import NewsGrid from "../NewsGrid";
import SkeletonCard from "../SkeletonCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function NewsComponent() {
  const { searchTerm } = useSearch();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          search: searchTerm,
        }).toString();

        const response = await fetch(`/api/news?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch news articles");
        }

        const data = await response.json();
        setArticles(data.news);

        // Calculate total pages based on totalArticles and limit
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
  }, [page, searchTerm]);

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center p-4">
        {" "}
        Search result for {searchTerm}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-2xl mx-auto p-4">
          {Array.from({ length: limit }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <NewsGrid articles={articles} />
      ) : (
        <div>No articles found</div>
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
  );
}

export default NewsComponent;
