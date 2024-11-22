// components/SkeletonCard.js
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const SkeletonCard = () => {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
      </CardContent>
      <CardFooter className="flex justify-between p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
      </CardFooter>
    </Card>
  );
};

export default SkeletonCard;
