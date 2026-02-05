const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("ENV DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "NOT SET");

/* ===== DATABASE ===== */
let pool;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is NOT set. DB will NOT work.");
} else {
  console.log("✅ DATABASE_URL found. Connecting to PostgreSQL...");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      brand TEXT,
      model TEXT,
      year INT,
      price INT,
      mileage INT,
      description TEXT
    )
  `)
  .then(() => console.log("✅ Table 'cars' is ready"))
  .catch(err => console.error("❌ DB INIT ERROR:", err));
}

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(express.static("public"));
app.use("/admin", express.static("admin"));

/* ===== API ===== */
app.get("/api/cars", async (req, res) => {
  if (!pool) return res.json([]);

  const result = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/cars", async (req, res) => {
  if (!pool) return res.status(500).json({ error: "DB not connected" });

  const { brand, model, year, price, mileage, description } = req.body;

  await pool.query(
    "INSERT INTO cars (brand, model, year, price, mileage, description) VALUES ($1,$2,$3,$4,$5,$6)",
    [brand, model, year, price, mileage, description]
  );

  res.json({ success: true });
});

/* ===== START ===== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
