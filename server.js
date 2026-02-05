const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== ADMIN AUTH ===== */
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "password";

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Auth required");
  }

  const [type, encoded] = auth.split(" ");
  if (type !== "Basic") return res.status(401).send("Invalid auth");

  const decoded = Buffer.from(encoded, "base64").toString();
  const [user, pass] = decoded.split(":");

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Admin Area"');
  return res.status(401).send("Invalid credentials");
}

/* ===== DATABASE ===== */
let pool;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
} else {
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
    .then(() => console.log("✅ DB ready"))
    .catch(err => console.error(err));
}

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(express.static("public"));

/* 🔐 PROTECTED ADMIN */
app.use("/admin", adminAuth, express.static("admin"));

/* ===== API ===== */
app.get("/api/cars", async (req, res) => {
  if (!pool) return res.json([]);
  const result = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/cars", adminAuth, async (req, res) => {
  if (!pool) return res.status(500).json({ error: "DB disabled" });

  const { brand, model, year, price, mileage, description } = req.body;

  await pool.query(
    "INSERT INTO cars (brand, model, year, price, mileage, description) VALUES ($1,$2,$3,$4,$5,$6)",
    [brand, model, year, price, mileage, description]
  );

  res.json({ success: true });
});

app.delete("/api/cars/:id", adminAuth, async (req, res) => {
  if (!pool) return res.status(500).json({ error: "DB disabled" });
  await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("🚀 Server started with admin auth");
});
