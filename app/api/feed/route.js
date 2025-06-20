import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

// ✅ OPTIONAL: Use API key from env for extra protection
const ALLOWED_ORIGIN = "https://newsfolio.vercel.app";
const EXPECTED_API_KEY = process.env.API_SECRET_KEY;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ✅ SECURITY CHECKS
    const origin = req.headers.get("origin");
    const apiKey = req.headers.get("x-api-key");

    if (origin !== ALLOWED_ORIGIN) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Invalid origin" },
        { status: 403 }
      );
    }

    if (EXPECTED_API_KEY && apiKey !== EXPECTED_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Invalid API key" },
        { status: 401 }
      );
    }

    // ✅ Query params
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

    // ✅ Step 1: Get user ID
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // ✅ Step 2: Get subscribed keywords
    const keywordResult = await pool.query("SELECT keyword FROM subscriptions WHERE user_id = $1", [userId]);
    if (keywordResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "No keywords subscribed" });
    }

    const keywords = keywordResult.rows.map(row => row.keyword);

    // ✅ Step 3: Build dynamic query
    const keywordConditions = keywords.map((_, i) => `title ~* $${i + 1}`).join(" OR ");
    const queryParams = [...keywords];

    // ✅ Step 4: Count matching articles
    const countQuery = `SELECT COUNT(*) AS total FROM news WHERE ${keywordConditions}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalArticles = parseInt(countResult.rows[0].total, 10);

    // ✅ Step 5: Fetch paginated results
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
