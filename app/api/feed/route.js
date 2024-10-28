// /api/feed

import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const page = parseInt(searchParams.get("page")) || 1; // Pagination page number
  const limit = parseInt(searchParams.get("limit")) || 10; // Pagination limit
  const offset = (page - 1) * limit;

  try {
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // Step 1: Retrieve user by email
    const emailQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(emailQuery, [email]);

    if (userResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // Step 2: Get user's subscribed keywords
    const keywordQuery = "SELECT keyword FROM subscriptions WHERE user_id = $1";
    const keywordResult = await pool.query(keywordQuery, [userId]);

    if (keywordResult.rowCount === 0) {
      return NextResponse.json({
        success: false,
        message: "No keywords subscribed",
      });
    }

    const keywords = keywordResult.rows.map((row) => row.keyword);

    // Step 3: Use keywords to filter news articles
    const keywordConditions = keywords
      .map((_, idx) => `title ~* $${idx + 1}`)
      .join(" OR "); // Use case-insensitive regex search for each keyword
    const params = keywords;

    // Count total articles matching the keywords
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM news 
      WHERE ${keywordConditions}
    `;
    const countResult = await pool.query(countQuery, params);
    const totalArticles = parseInt(countResult.rows[0].total, 10);

    // Fetch the actual news articles with pagination
    const newsQuery = `
      SELECT title, link, date, description, source, created_at
      FROM news 
      WHERE ${keywordConditions} 
      ORDER BY created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset); // Add limit and offset to the params

    const newsResult = await pool.query(newsQuery, params);

    const newsList = newsResult.rows.map((item) => ({
      title: item.title,
      link: item.link,
      date: item.date ? item.date.toISOString() : null,
      description: item.description,
      source: item.source,
      created_at: item.created_at,
    }));

    // Return the news feed with pagination info
    return NextResponse.json({
      success: true,
      page,
      limit,
      news: newsList,
      totalArticles,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
