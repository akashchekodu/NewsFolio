import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import SkeletonCard from "./SkeletonCard";

const NewsGrid = ({ articles, isLoading }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-2xl mx-auto p-4">
      {isLoading
        ? Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        : articles.map((article, index) => (
            <NewsCard
              key={index}
              title={article.title}
              description={article.description}
              source={article.source}
              date={article.date}
              link={article.link}
              created_at={article.created_at}
            />
          ))}
    </div>
  );
};

export default NewsGrid;
