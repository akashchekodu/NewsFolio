"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

const Skeleton = () => (
  <div className="animate-pulse space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 rounded"></div>
    ))}
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">
        Manage Your Subscriptions
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Add New Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleAddKeyPress}
              placeholder="Enter a keyword"
              className="flex-grow"
            />
            <Button
              onClick={handleAddKeyword}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {btnLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Your Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton />
          ) : keywords.length === 0 ? (
            <p className="text-muted-foreground text-center">
              You haven&apos;t subscribed to any keywords yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {keywords.map((keyword) => (
                <div
                  key={keyword}
                  className="group flex items-center justify-between p-3 bg-secondary rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <span className="text-base font-medium truncate mr-2">
                    {keyword}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveKeyword(keyword)}
                    disabled={loading}
                    aria-label={`Remove ${keyword}`}
                    className="border-red-200 hover:border-red-300 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 text-red-500 group-hover:text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscribePage;
