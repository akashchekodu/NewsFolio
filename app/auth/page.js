"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

const Skeleton = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded shadow dark:bg-gray-800 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto" />
      <div className="space-y-4">
        <div className="h-10 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>
    </div>
  </div>
);

export default function Login() {
  const [providers, setProviders] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Fetch the providers and set them in state
    getProviders().then((res) => setProviders(res));
    setIsMounted(true);
  }, []);

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

  if (!providers) return <Skeleton />; // Show skeleton while loading

  return (
    <div>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 p-8 bg-white rounded shadow dark:bg-gray-800">
          <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
            Sign in to MyApp
          </h2>
          <div className="space-y-4">
            {Object.values(providers).map((provider) => (
              <button
                key={provider.name}
                onClick={() => signIn(provider.id, { callbackUrl: "/feed" })}
                className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Sign in with {provider.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
