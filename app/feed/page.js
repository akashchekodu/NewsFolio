"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NewsGrid from "../news/NewsGrid";
import SkeletonCard from "../news/SkeletonCard";
import { useSession } from "next-auth/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function FeedPage() {
  const [feedArticles, setFeedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const limit = 12;
  const [isMobile, setIsMobile] = useState(false);

  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  useEffect(() => {
    setIsMounted(true);
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
    if (!userEmail) return;

    const fetchFeedArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          email: userEmail,
          page,
          limit,
        }).toString();

        const response = await fetch(`/api/feed?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch feed articles");
        }

        const data = await response.json();
        setFeedArticles(data.news);

        const totalArticles = data.totalArticles || 0;
        setTotalPages(Math.ceil(totalArticles / limit));
      } catch (err) {
        console.error("Error fetching feed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedArticles();
  }, [page, userEmail]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPaginationRange = () => {
    const range = [];
    const maxPagesToShow = 3;
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

  if (!isMounted) {
    return (
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
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>You need to be logged in to view your feed.</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (totalPages === 0) {
    return (
      <div className="h-[93.6vh] flex flex-col">
        <h1 className="text-3xl font-bold  p-4 sticky top-0 bg-white">
          Your Feed
        </h1>
        <div className="flex-grow flex items-center justify-center">
          <div className="grid gap-4 w-60">
            <svg
              class="mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              width="200"
              height="200"
              viewBox="0 0 154 161"
              fill="none"
            >
              <path
                d="M0.0616455 84.4268C0.0616455 42.0213 34.435 7.83765 76.6507 7.83765C118.803 7.83765 153.224 42.0055 153.224 84.4268C153.224 102.42 147.026 118.974 136.622 132.034C122.282 150.138 100.367 161 76.6507 161C52.7759 161 30.9882 150.059 16.6633 132.034C6.25961 118.974 0.0616455 102.42 0.0616455 84.4268Z"
                fill="#EEF2FF"
              />
              <path
                d="M96.8189 0.632498L96.8189 0.632384L96.8083 0.630954C96.2034 0.549581 95.5931 0.5 94.9787 0.5H29.338C22.7112 0.5 17.3394 5.84455 17.3394 12.4473V142.715C17.3394 149.318 22.7112 154.662 29.338 154.662H123.948C130.591 154.662 135.946 149.317 135.946 142.715V38.9309C135.946 38.0244 135.847 37.1334 135.648 36.2586L135.648 36.2584C135.117 33.9309 133.874 31.7686 132.066 30.1333C132.066 30.1331 132.065 30.1329 132.065 30.1327L103.068 3.65203C103.068 3.6519 103.067 3.65177 103.067 3.65164C101.311 2.03526 99.1396 0.995552 96.8189 0.632498Z"
                fill="white"
                stroke="#E5E7EB"
              />
              <ellipse
                cx="80.0618"
                cy="81"
                rx="28.0342"
                ry="28.0342"
                fill="#EEF2FF"
              />
              <path
                d="M99.2393 61.3061L99.2391 61.3058C88.498 50.5808 71.1092 50.5804 60.3835 61.3061C49.6423 72.0316 49.6422 89.4361 60.3832 100.162C71.109 110.903 88.4982 110.903 99.2393 100.162C109.965 89.4363 109.965 72.0317 99.2393 61.3061ZM105.863 54.6832C120.249 69.0695 120.249 92.3985 105.863 106.785C91.4605 121.171 68.1468 121.171 53.7446 106.785C39.3582 92.3987 39.3582 69.0693 53.7446 54.683C68.1468 40.2965 91.4605 40.2966 105.863 54.6832Z"
                stroke="#E5E7EB"
              />
              <path
                d="M110.782 119.267L102.016 110.492C104.888 108.267 107.476 105.651 109.564 102.955L118.329 111.729L110.782 119.267Z"
                stroke="#E5E7EB"
              />
              <path
                d="M139.122 125.781L139.122 125.78L123.313 109.988C123.313 109.987 123.313 109.987 123.312 109.986C121.996 108.653 119.849 108.657 118.521 109.985L118.871 110.335L118.521 109.985L109.047 119.459C107.731 120.775 107.735 122.918 109.044 124.247L109.047 124.249L124.858 140.06C128.789 143.992 135.191 143.992 139.122 140.06C143.069 136.113 143.069 129.728 139.122 125.781Z"
                fill="#A5B4FC"
                stroke="#818CF8"
              />
              <path
                d="M83.185 87.2285C82.5387 87.2285 82.0027 86.6926 82.0027 86.0305C82.0027 83.3821 77.9987 83.3821 77.9987 86.0305C77.9987 86.6926 77.4627 87.2285 76.8006 87.2285C76.1543 87.2285 75.6183 86.6926 75.6183 86.0305C75.6183 80.2294 84.3831 80.2451 84.3831 86.0305C84.3831 86.6926 83.8471 87.2285 83.185 87.2285Z"
                fill="#4F46E5"
              />
              <path
                d="M93.3528 77.0926H88.403C87.7409 77.0926 87.2049 76.5567 87.2049 75.8946C87.2049 75.2483 87.7409 74.7123 88.403 74.7123H93.3528C94.0149 74.7123 94.5509 75.2483 94.5509 75.8946C94.5509 76.5567 94.0149 77.0926 93.3528 77.0926Z"
                fill="#4F46E5"
              />
              <path
                d="M71.5987 77.0925H66.6488C65.9867 77.0925 65.4507 76.5565 65.4507 75.8945C65.4507 75.2481 65.9867 74.7122 66.6488 74.7122H71.5987C72.245 74.7122 72.781 75.2481 72.781 75.8945C72.781 76.5565 72.245 77.0925 71.5987 77.0925Z"
                fill="#4F46E5"
              />
              <rect
                x="38.3522"
                y="21.5128"
                width="41.0256"
                height="2.73504"
                rx="1.36752"
                fill="#4F46E5"
              />
              <rect
                x="38.3522"
                y="133.65"
                width="54.7009"
                height="5.47009"
                rx="2.73504"
                fill="#A5B4FC"
              />
              <rect
                x="38.3522"
                y="29.7179"
                width="13.6752"
                height="2.73504"
                rx="1.36752"
                fill="#4F46E5"
              />
              <circle cx="56.13" cy="31.0854" r="1.36752" fill="#4F46E5" />
              <circle cx="61.6001" cy="31.0854" r="1.36752" fill="#4F46E5" />
              <circle cx="67.0702" cy="31.0854" r="1.36752" fill="#4F46E5" />
            </svg>
            <h2 className="text-center text-lg font-semibold text-gray-900">
              No News Found
            </h2>
            <h3 className="text-center text-sm text-gray-500">
              Add Subsciptions
            </h3>
            <Button>
              <Link href="/subscribe">Subsciptions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative  pt-8 flex justify-center items-center p-4">
        <h1 className="text-3xl  font-bold absolute left-1/2 transform -translate-x-1/2">
          Your Feed
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-2xl mx-auto p-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <NewsGrid articles={feedArticles} />
      )}

      {!loading && (
        <div className="p-4">
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
      )}
    </div>
  );
}

export default FeedPage;
