const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== DATABASE ===== */
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        brand TEXT,
        model TEXT,
        year INT,
        price INT,
        mileage INT,
        description TEXT
      )
    `);
  })();
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

app.get("/api/cars/:id", async (req, res) => {
  if (!pool) return res.json(null);
  const result = await pool.query("SELECT * FROM cars WHERE id=$1", [req.params.id]);
  res.json(result.rows[0]);
});

app.post("/api/cars", async (req, res) => {
  if (!pool) return res.json({ error: "DB disabled locally" });

  const { brand, model, year, price, mileage, description } = req.body;
  await pool.query(
    "INSERT INTO cars (brand, model, year, price, mileage, description) VALUES ($1,$2,$3,$4,$5,$6)",
    [brand, model, year, price, mileage, description]
  );
  res.json({ success: true });
});

app.delete("/api/cars/:id", async (req, res) => {
  if (!pool) return res.json({ error: "DB disabled locally" });

  await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

/* ===== START ===== */
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
