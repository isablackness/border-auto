const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static("public"));

/* ===== API ===== */

app.get("/api/cars", async (req, res) => {
  const result = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  res.json(result.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT * FROM cars WHERE id = $1",
    [id]
  );
  res.json(result.rows[0]);
});

/* ===== Admin auth ===== */

const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).end();
  }

  const [login, password] = Buffer
    .from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (login === "admin" && password === "admin123") {
    return next();
  }

  res.setHeader("WWW-Authenticate", "Basic");
  res.status(401).end();
};

app.use("/admin", adminAuth, express.static("admin"));

/* ===== Start ===== */

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
