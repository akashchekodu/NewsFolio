"use client";
import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
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
          search: searchTerm || "",
        }).toString();

        const response = await fetch(`/api/news?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch news articles");
        }

        const data = await response.json();
        setArticles(data.news);

        // Calculate total pages based on totalArticles and limit
        const totalArticles = data.totalArticles || 0;
        console.log(totalArticles);
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center p-4"> Latest News</h1>

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
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(page - 1)}
                  />
                </PaginationItem>
              )}
              {[...Array(totalPages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href="#"
                    isActive={page === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {page < totalPages && (
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
      )}
    </div>
  );
}

export default NewsComponent;
