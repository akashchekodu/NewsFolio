# NewsFolio

NewsFolio is a news aggregator web application that fetches and displays news articles from various sources, allowing users to stay updated with the latest happenings in real-time. Users can subscribe to specific topics or stocks, and relevant news articles will be displayed on their dashboard.

## Features

- Aggregates news from multiple sources.
- Real-time updates on subscribed topics.
- User-friendly interface for easy navigation.
- Subscription management for personalized news feeds.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS, daisyUI
- **Backend:** Nodejs
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js and npm
- Supabase account for database management

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/akashchekodu/NewsFolio.git
   cd NewsFolio
   ```

2. Install dependencies:

   ```bash
   cd app
   npm install
   ```

### Configuration

1. Set up your Supabase database and create a `.env` file in the backend directory with the following variables:

   ```env
   DB_CONNECTION_STRING
   NEXTAUTH_SECRET
   GITHUB_ID
   GITHUB_SECRET
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   ```

### Running the Application

1. Start the development server:

   ```bash
   cd app
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Upon starting the application, users can create an account to manage their subscriptions.
- Users can subscribe to specific stocks or topics to receive tailored news updates.
- The application will periodically update with new articles based on user preferences.

## Scraper Information

If you want to learn more about the scraper used in this project, visit the [FinScrape repository](https://github.com/akashchekodu/FinScrape).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Submit a pull request detailing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Scrapy](https://scrapy.org/) for web scraping capabilities.
- [Next.js](https://nextjs.org/) for building the frontend.
- [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/) for styling.
