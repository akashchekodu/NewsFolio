import NewsComponent from "./NewsComponent";

export const metadata = {
  title: "Latest News - NewsFolio",
  description: "Stay updated with the latest financial news.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function NewsPage() {
  return <NewsComponent />;
}
