// /api/subscribe

import { NextResponse } from "next/server";
import pool from "@/app/utils/connection";

const ALLOWED_ORIGIN = "https://newsfolio.vercel.app";
const VALID_API_KEY = process.env.API_SECRET_KEY;

// 🔒 Common security middleware
async function checkSecurity(req) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const apiKey = req.headers.get("x-api-key");

  if (
    (origin && origin !== ALLOWED_ORIGIN) ||
    (referer && !referer.startsWith(ALLOWED_ORIGIN))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!apiKey || apiKey !== VALID_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // pass
}

// 🔐 POST: Add keyword
export async function POST(req) {
  const sec = await checkSecurity(req);
  if (sec) return sec;

  const { keyword, email } = await req.json();

  try {
    if (!keyword || !email) {
      return NextResponse.json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = userRes.rows[0].id;

    const checkRes = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1 AND keyword = $2",
      [userId, keyword]
    );

    if (checkRes.rowCount > 0) {
      return NextResponse.json({
        success: false,
        message: "Already subscribed to this keyword",
      });
    }

    await pool.query("INSERT INTO subscriptions (user_id, keyword) VALUES ($1, $2)", [userId, keyword]);

    return NextResponse.json({
      success: true,
      message: "Keyword subscribed successfully",
    });
  } catch (error) {
    console.error("Error subscribing keyword:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔐 GET: Retrieve keywords
export async function GET(req) {
  const sec = await checkSecurity(req);
  if (sec) return sec;

  const email = req.nextUrl.searchParams.get("email");

  try {
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = userRes.rows[0].id;

    const keywordRes = await pool.query(
      "SELECT keyword FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    const keywords = keywordRes.rows.map((row) => row.keyword);

    return NextResponse.json({ success: true, keywords });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔐 DELETE: Remove keyword
export async function DELETE(req) {
  const sec = await checkSecurity(req);
  if (sec) return sec;

  const { keyword, email } = await req.json();

  try {
    if (!keyword || !email) {
      return NextResponse.json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = userRes.rows[0].id;

    const deleteRes = await pool.query(
      "DELETE FROM subscriptions WHERE user_id = $1 AND keyword = $2",
      [userId, keyword]
    );

    if (deleteRes.rowCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Keyword not found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Keyword unsubscribed successfully",
    });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
