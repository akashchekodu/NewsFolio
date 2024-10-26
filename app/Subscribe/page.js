"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

// Skeleton Loader Component
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-300 rounded mb-4"></div>
    <div className="h-8 bg-gray-200 rounded mb-2"></div>
    <div className="h-8 bg-gray-200 rounded mb-2"></div>
    <div className="h-8 bg-gray-200 rounded mb-2"></div>
  </div>
);

const SubscribePage = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Fetch the providers and set them in state
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubscriptions(session.user.email);
    }
  }, [status]);

  const fetchSubscriptions = async (email) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/subscribe?email=${email}`);
      const data = await response.json();
      if (data.success) {
        setKeywords(data.keywords);
      } else {
        setError(data.message || "Failed to fetch subscriptions.");
      }
    } catch (error) {
      setError(`Error fetching subscriptions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddKeyword();
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword) {
      setError("Keyword cannot be empty.");
      return;
    }

    if (keywords.includes(newKeyword)) {
      setError("This keyword is already subscribed.");
      return;
    }

    if (newKeyword && !keywords.includes(newKeyword) && session) {
      setLoading(true);
      setBtnLoading(true);
      setError("");
      try {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword: newKeyword,
            email: session.user.email,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setKeywords([...keywords, newKeyword]);
          setNewKeyword("");
        } else {
          setError(data.message || "Failed to subscribe.");
        }
      } catch (error) {
        setError(`Error subscribing: ${error.message}`);
      } finally {
        setLoading(false);
        setBtnLoading(false);
      }
    }
  };

  const handleRemoveKeyword = async (keyword) => {
    if (session) {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword, email: session.user.email }),
        });
        const data = await response.json();
        if (data.success) {
          setKeywords(keywords.filter((k) => k !== keyword));
        } else {
          setError(data.message || "Failed to unsubscribe.");
        }
      } catch (error) {
        setError(`Error unsubscribing: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
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

  return (
    <div className="flex flex-col h-[93.6vh] container mx-auto p-4 overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Manage Your Subscriptions
      </h1>

      <div className="flex-grow flex flex-col gap-6 items-center">
        {" "}
        {/* Center the cards */}
        <Card className="flex-shrink-0 max-w-5xl w-full text-center mx-auto">
          {" "}
          {/* Center the card */}
          <CardHeader>
            <CardTitle>Add New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 items-center">
              {" "}
              {/* Center the inner content */}
              <div className="flex gap-2 justify-center">
                {" "}
                {/* Center the input and button */}
                <Input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyPress}
                  placeholder="Enter a keyword"
                  className="max-w-sm w-full"
                />
                <Button onClick={handleAddKeyword} disabled={loading}>
                  {btnLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm" role="alert">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="flex-grow overflow-hidden flex flex-col max-w-5xl max-h-[70vh] w-full">
          {" "}
          {/* Max width reduced */}
          <CardHeader>
            <CardTitle className="text-center">Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            {loading ? (
              <Skeleton />
            ) : keywords.length === 0 ? (
              <p className="text-muted-foreground">
                You haven't subscribed to any keywords yet.
              </p>
            ) : (
              <div className="h-full flex-grow overflow-y-auto max-h-[55vh] md:max-h-[60vh] pr-2">
                <ul className="space-y-2">
                  {keywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        {keyword}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={loading}
                        aria-label={`Remove ${keyword}`}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700"
                      >
                        {loading ? "Removing..." : <X className="h-4 w-4" />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscribePage;
