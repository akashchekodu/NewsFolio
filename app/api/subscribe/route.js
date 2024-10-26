// /api/subscribe

import pool from "@/app/utils/connection"; // Assuming this is your database connection
import { NextResponse } from "next/server";

// POST: Add a new keyword subscription for the user
export async function POST(req) {
  const { keyword, email } = await req.json();

  try {
    if (!keyword || !email) {
      return NextResponse.json({
        success: false,
        message: "Please enter all fields",
      });
    }

    // Check if the user exists
    const emailQuery = "SELECT id FROM users WHERE email = $1";
    const res = await pool.query(emailQuery, [email]);

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = res.rows[0].id;

    // Check if the keyword already exists for this user
    const keywordQuery =
      "SELECT * FROM subscriptions WHERE user_id = $1 AND keyword = $2";
    const keywordRes = await pool.query(keywordQuery, [userId, keyword]);

    if (keywordRes.rowCount > 0) {
      return NextResponse.json({
        success: false,
        message: "Already subscribed to this keyword",
      });
    }

    // Insert the new keyword for this user
    const insertQuery =
      "INSERT INTO subscriptions (user_id, keyword) VALUES ($1, $2)";
    await pool.query(insertQuery, [userId, keyword]);

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

// GET: Fetch all keywords subscribed by the user
export async function GET(req) {
  const email = req.nextUrl.searchParams.get("email"); // Get email from query parameters

  try {
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if the user exists
    const emailQuery = "SELECT id FROM users WHERE email = $1";
    const res = await pool.query(emailQuery, [email]);

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = res.rows[0].id;

    // Get all keywords the user has subscribed to
    const keywordsQuery =
      "SELECT keyword FROM subscriptions WHERE user_id = $1";
    const keywordsRes = await pool.query(keywordsQuery, [userId]);

    const keywords = keywordsRes.rows.map((row) => row.keyword);

    return NextResponse.json({ success: true, keywords });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a keyword subscription for the user
export async function DELETE(req) {
  const { keyword, email } = await req.json();

  try {
    if (!keyword || !email) {
      return NextResponse.json({
        success: false,
        message: "Please enter all fields",
      });
    }

    // Check if the user exists
    const emailQuery = "SELECT id FROM users WHERE email = $1";
    const res = await pool.query(emailQuery, [email]);

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const userId = res.rows[0].id;

    // Delete the keyword subscription
    const deleteQuery =
      "DELETE FROM subscriptions WHERE user_id = $1 AND keyword = $2";
    const deleteRes = await pool.query(deleteQuery, [userId, keyword]);

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
