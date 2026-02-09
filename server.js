import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ================= GET ALL ================= */
app.get("/api/cars", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "get cars failed" });
  }
});

/* ================= GET ONE ================= */
app.get("/api/cars/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM cars WHERE id = $1",
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).end();
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "get car failed" });
  }
});

/* ================= UPDATE ================= */
app.put("/api/cars/:id", async (req, res) => {
  try {
    const id = req.params.id;

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

    console.log("UPDATE CAR", id, req.body); // 🔴 ВАЖНО

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
        JSON.stringify(images || []), // 🔴 КРИТИЧНО
        id
      ]
    );

    res.json(r.rows[0]);
  } catch (e) {
    console.error("UPDATE ERROR:", e); // 🔴 увидишь точную ошибку
    res.status(500).json({ error: "update failed" });
  }
});

/* ================= DELETE ================= */
app.delete("/api/cars/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cars WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete failed" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
