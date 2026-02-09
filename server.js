import express from "express";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "10mb" }));

/* ===== STATIC ===== */
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.redirect("/catalog.html");
});

/* ===== DB ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== API ===== */

// Получить все машины
app.get("/api/cars", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM cars ORDER BY position DESC"
  );
  res.json(r.rows);
});

// Получить одну машину
app.get("/api/cars/:id", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM cars WHERE id = $1",
    [req.params.id]
  );
  if (!r.rows.length) return res.status(404).end();
  res.json(r.rows[0]);
});

// Обновить машину (АДМИНКА)
app.put("/api/cars/:id", async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      price,
      mileage,
      engine,
      gearbox,
      description,
      images
    } = req.body;

    const imagesArray = Array.isArray(images) ? images : [];

    const r = await pool.query(
      `
      UPDATE cars SET
        brand = $1,
        model = $2,
        year = $3,
        price = $4,
        mileage = $5,
        engine = $6,
        gearbox = $7,
        description = $8,
        images = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        brand,
        model,
        year ? Number(year) : null,
        price ? Number(price) : null,
        mileage ? Number(mileage) : null,
        engine || null,
        gearbox || null,
        description || null,
        imagesArray,
        Number(req.params.id)
      ]
    );

    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "update failed" });
  }
});

// Удалить машину
app.delete("/api/cars/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM cars WHERE id = $1",
    [Number(req.params.id)]
  );
  res.json({ ok: true });
});

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
