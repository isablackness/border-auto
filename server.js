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

/* ===== ROOT → CATALOG ===== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

/* ===== API: CARS WITH FILTERS ===== */

app.get("/api/cars", async (req, res) => {
  const { brand, year, price, mileage } = req.query;

  let conditions = [];
  let values = [];
  let i = 1;

  if (brand) {
    conditions.push(`brand ILIKE $${i++}`);
    values.push(`%${brand}%`);
  }

  if (year) {
    conditions.push(`year >= $${i++}`);
    values.push(year);
  }

  if (price) {
    conditions.push(`price <= $${i++}`);
    values.push(price);
  }

  if (mileage) {
    conditions.push(`mileage <= $${i++}`);
    values.push(mileage);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const query = `
    SELECT * FROM cars
    ${where}
    ORDER BY id DESC
  `;

  const result = await pool.query(query, values);
  res.json(result.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM cars WHERE id = $1",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

/* ===== ADMIN AUTH ===== */

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

  if (login === "admin" && password === "admin123") return next();

  res.setHeader("WWW-Authenticate", "Basic");
  res.status(401).end();
};

app.use("/admin", adminAuth, express.static("admin"));

/* ===== START ===== */

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
