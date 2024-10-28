"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon for back button
import { useRouter } from "next/navigation"; // Import Next.js useRouter
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
  const router = useRouter(); // Initialize router

  useEffect(() => {
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
          {/* Loader */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[93.6vh] container mx-auto p-4 overflow-hidden">
      {/* Header section with Back Button and centered Title */}
      <div className="flex justify-between items-center mb-6">
        <Button
          className=" "
          onClick={() => router.push("/feed")} // Navigate to feed page
        >
          <ArrowLeft className="mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-center flex-grow">
          Manage Your Subscriptions
        </h1>
        <div className="w-16"></div>{" "}
        {/* Empty div to balance the flex layout */}
      </div>

      <div className="flex-grow flex flex-col gap-6 items-center">
        <Card className="flex-shrink-0 max-w-5xl w-full text-center mx-auto">
          <CardHeader>
            <CardTitle>Add New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 items-center">
              <div className="flex gap-2 justify-center">
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
          <CardHeader>
            <CardTitle className="text-center">Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            {loading ? (
              <Skeleton />
            ) : keywords.length === 0 ? (
              <p className="text-muted-foreground">
                You haven&apos;t subscribed to any keywords yet.
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
