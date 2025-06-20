import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

const ALLOWED_ORIGINS = new Set([
  "https://newsfolio.vercel.app",
  "https://financial-news-nextjs-3o2y.vercel.app",
]);

const VALID_API_KEY = process.env.API_SECRET_KEY;

export async function GET(req) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const apiKey = req.headers.get("x-api-key");

  // ✅ Enforce domain-based protection
  const isOriginAllowed = origin && ALLOWED_ORIGINS.has(origin);
  const isRefererAllowed =
    referer && [...ALLOWED_ORIGINS].some((site) => referer.startsWith(site));

  if (!isOriginAllowed && !isRefererAllowed) {
    return NextResponse.json({ error: "Forbidden: Untrusted origin" }, { status: 403 });
  }

  // ✅ Optional: API key validation (toggle on/off here)
  if (VALID_API_KEY && apiKey !== VALID_API_KEY) {
    return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
  }

  // ✅ Proceed with logic
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("search") || "";
  const sourceFilter = searchParams.get("source") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    // 📄 WHERE Conditions Builder
    let sqlQuery = `SELECT title, link, date, description, source, created_at FROM news WHERE TRUE`;
    let countQuery = `SELECT COUNT(*) AS total FROM news WHERE TRUE`;

    const conditions = [];
    const params = [];
    const countParams = [];

    if (searchQuery) {
      conditions.push(`title ~* $${conditions.length + 1}`);
      params.push(`\\y${searchQuery}\\y`);

      countParams.push(`\\y${searchQuery}\\y`);
    }

    if (sourceFilter) {
      conditions.push(`source = $${conditions.length + 1}`);
      params.push(sourceFilter);

      countParams.push(sourceFilter);
    }

    if (conditions.length) {
      const clause = " AND " + conditions.join(" AND ");
      sqlQuery += clause;
      countQuery += clause;
    }

    // Count total
    const countResult = await pool.query(countQuery, countParams);
    const totalArticles = parseInt(countResult.rows[0].total, 10);

    // Paginate + fetch
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(sqlQuery, params);

    const newsList = result.rows.map((item) => ({
      title: item.title,
      link: item.link,
      date: item.date?.toISOString() || null,
      description: item.description,
      source: item.source,
      created_at: item.created_at,
    }));

    return NextResponse.json({
      page,
      limit,
      news: newsList,
      totalArticles,
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
