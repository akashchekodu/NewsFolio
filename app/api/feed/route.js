import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

// ✅ ALLOWLISTED ORIGINS
const ALLOWED_ORIGINS = new Set([
  "https://newsfolio.vercel.app",
  "https://financial-news-nextjs-3o2y.vercel.app"
]);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    // ✅ Reject if request is from an unknown site
    const originAllowed = origin && ALLOWED_ORIGINS.has(origin);
    const refererAllowed = referer && [...ALLOWED_ORIGINS].some((allowed) => referer.startsWith(allowed));

    if (!originAllowed && !refererAllowed) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Untrusted origin or referer" },
        { status: 403 }
      );
    }

    const email = searchParams.get("email");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const keywordResult = await pool.query("SELECT keyword FROM subscriptions WHERE user_id = $1", [userId]);
    if (keywordResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "No keywords subscribed" });
    }

    const keywords = keywordResult.rows.map(row => row.keyword);

    const keywordConditions = keywords.map((_, i) => `title ~* $${i + 1}`).join(" OR ");
    const queryParams = [...keywords];

    const countQuery = `SELECT COUNT(*) AS total FROM news WHERE ${keywordConditions}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalArticles = parseInt(countResult.rows[0].total, 10);

    const newsQuery = `
      SELECT title, link, date, description, source, created_at
      FROM news 
      WHERE ${keywordConditions}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(limit, offset);

    const newsResult = await pool.query(newsQuery, queryParams);

    const newsList = newsResult.rows.map(item => ({
      title: item.title,
      link: item.link,
      date: item.date ? item.date.toISOString() : null,
      description: item.description,
      source: item.source,
      created_at: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      news: newsList,
      totalArticles,
    });
  } catch (error) {
    console.error("❌ Error fetching feed:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
