"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

const SubscribePage = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");

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
  }, [status, session]);

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

  return (
    <div className="flex flex-col h-[93.6vh] container mx-auto p-4 overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Manage Your Subscriptions
      </h1>

      <div className="flex-grow flex flex-col gap-6 overflow-hidden">
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle>Add New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyPress}
                  placeholder="Enter a keyword"
                  className="max-w-sm"
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

        <Card className="flex-grow overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-center">Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : keywords.length === 0 ? (
              <p className="text-muted-foreground">
                You haven't subscribed to any keywords yet.
              </p>
            ) : (
              <div className="h-full overflow-y-auto pr-2">
                <ul className="space-y-2">
                  {keywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span>{keyword}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={loading}
                        aria-label={`Remove ${keyword}`}
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
