import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

const ALLOWED_ORIGIN = "https://newsfolio.vercel.app";
const VALID_API_KEY = process.env.API_SECRET_KEY; // Stored in Vercel env vars

export async function GET(req) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const apiKey = req.headers.get("x-api-key");

  // ✅ Block if origin/referer are not from your frontend
  if (
    origin && origin !== ALLOWED_ORIGIN ||
    referer && !referer.startsWith(ALLOWED_ORIGIN)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Block if x-api-key is missing or invalid
  if (!apiKey || apiKey !== VALID_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🌐 Now process the DB logic
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("search") || "";
  const sourceFilter = searchParams.get("source") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    let sqlQuery = `
      SELECT title, link, date, description, source, created_at
      FROM news 
      WHERE TRUE
    `;

    const queryConditions = [];
    const params = [];

    if (searchQuery) {
      queryConditions.push(`title ~* $${queryConditions.length + 1}`);
      params.push(`\\y${searchQuery}\\y`);
    }

    if (sourceFilter) {
      queryConditions.push(`source = $${queryConditions.length + 1}`);
      params.push(sourceFilter);
    }

    if (queryConditions.length > 0) {
      sqlQuery += " AND " + queryConditions.join(" AND ");
    }

    let countQuery = `
      SELECT COUNT(*) AS total 
      FROM news 
      WHERE TRUE
    `;

    const countConditions = [];
    const countParams = [];

    if (searchQuery) {
      countConditions.push(`title ~* $${countConditions.length + 1}`);
      countParams.push(`\\y${searchQuery}\\y`);
    }

    if (sourceFilter) {
      countConditions.push(`source = $${countConditions.length + 1}`);
      countParams.push(sourceFilter);
    }

    if (countConditions.length > 0) {
      countQuery += " AND " + countConditions.join(" AND ");
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalArticles = parseInt(countResult.rows[0].total, 10);

    sqlQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(sqlQuery, params);

    const newsList = result.rows.map((item) => ({
      title: item.title,
      link: item.link,
      date: item.date ? item.date.toISOString() : null,
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
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
