require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health Check ───────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "UP", database: "CONNECTED" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(503).json({ status: "DOWN", database: "DISCONNECTED" });
  }
});

// ── GET all books ──────────────────────────────────────────
app.get("/api/books", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books ORDER BY added_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching books:", err.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// ── POST a new book ────────────────────────────────────────
app.post("/api/books", async (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res
      .status(400)
      .json({ error: "Both 'title' and 'author' are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *",
      [title.trim(), author.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding book:", err.message);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// ── PUT toggle read status ─────────────────────────────────
app.put("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body;

  if (typeof is_read !== "boolean") {
    return res
      .status(400)
      .json({ error: "'is_read' must be a boolean value" });
  }

  try {
    const result = await pool.query(
      "UPDATE books SET is_read = $1 WHERE id = $2 RETURNING *",
      [is_read, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating book:", err.message);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// ── DELETE a book ──────────────────────────────────────────
app.delete("/api/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted", book: result.rows[0] });
  } catch (err) {
    console.error("Error deleting book:", err.message);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`📚 Backend server running on http://0.0.0.0:${PORT}`);
});
