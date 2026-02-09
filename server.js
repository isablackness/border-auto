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

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

app.get("/", (req, res) => {
  res.redirect("/catalog.html");
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== API ===== */

app.get("/api/cars", async (req, res) => {
  const r = await pool.query("SELECT * FROM cars ORDER BY position DESC");
  res.json(r.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM cars WHERE id = $1",
    [req.params.id]
  );
  if (!r.rows.length) return res.status(404).end();
  res.json(r.rows[0]);
});

app.put("/api/cars/:id", async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      price,
      mileage,
      engine_volume,
      fuel_type,
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
        engine_volume = $6,
        fuel_type = $7,
        gearbox = $8,
        description = $9,
        images = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        brand,
        model,
        year ? Number(year) : null,
        price ? Number(price) : null,
        mileage ? Number(mileage) : null,
        engine_volume ? Number(engine_volume) : null,
        fuel_type || null,
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

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
