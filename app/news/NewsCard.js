// components/NewsCard.js
import React from "react";
import { Clock, Newspaper, ArrowUpRight } from "lucide-react";

const NewsCard = ({ title, description, source, date, link, created_at }) => {
  // Parse and format the created_at date
  const formattedDate = created_at ? new Date(created_at) : null;

  // Format date to a readable string
  const displayDate = formattedDate
    ? formattedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Date not available"; // Fallback in case there's no date

  return (
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105"
      style={{ backgroundColor: "var(--secondary-bg)" }} // Fixed typo here
    >
      <a href={link} target="_blank" rel="noopener noreferrer">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
      </a>
      <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
      <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-300">
        <Newspaper className="w-3 h-3 mr-1" />
        <span>{source}</span>
        <Clock className="w-3 h-3 mr-1" />
        <span>{displayDate}</span>
      </div>
    </div>
  );
};

export default NewsCard;
