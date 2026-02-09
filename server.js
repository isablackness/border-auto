import express from "express";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "10mb" }));

/* ===== STATIC ===== */
app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});

/* ===== DB ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== API ===== */

app.get("/api/cars", async (req, res) => {
  const r = await pool.query("SELECT * FROM cars ORDER BY id DESC");
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
      gearbox,
      description,
      images
    } = req.body;

    const r = await pool.query(
      `
      UPDATE cars SET
        brand = $1,
        model = $2,
        year = $3,
        price = $4,
        mileage = $5,
        gearbox = $6,
        description = $7,
        images = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        brand,
        model,
        year,
        price,
        mileage,
        gearbox || null,
        description || null,
        JSON.stringify(images || []),
        req.params.id
      ]
    );

    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "update failed" });
  }
});

app.delete("/api/cars/:id", async (req, res) => {
  await pool.query("DELETE FROM cars WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
