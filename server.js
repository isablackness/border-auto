const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== DB ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== MIDDLEWARE (ORDER IS CRITICAL) ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== PUBLIC STATIC ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== SESSION ===== */
app.use(
  session({
    name: "border-auto-admin",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

/* ===== API (PUBLIC) ===== */
app.get("/api/cars", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM cars ORDER BY position ASC NULLS LAST"
  );
  res.json(result.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM cars WHERE id=$1",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

/* ===== ADMIN AUTH ===== */
const requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  res.status(401).json({ error: "unauthorized" });
};

/* ===== ADMIN API ===== */
app.post("/api/admin/cars", requireAdmin, async (req, res) => {
  const { brand, model, year, price, mileage, description, images } = req.body;

  const result = await pool.query(
    `
    INSERT INTO cars
    (brand, model, year, price, mileage, description, images, position)
    VALUES ($1,$2,$3,$4,$5,$6,$7,
      (SELECT COALESCE(MAX(position),0)+1 FROM cars)
    )
    RETURNING id
    `,
    [brand, model, year, price, mileage, description, images]
  );

  res.json({ id: result.rows[0].id });
});

app.put("/api/admin/cars/:id", requireAdmin, async (req, res) => {
  const { brand, model, year, price, mileage, description, images } = req.body;

  await pool.query(
    `
    UPDATE cars SET
      brand=$1, model=$2, year=$3, price=$4,
      mileage=$5, description=$6, images=$7
    WHERE id=$8
    `,
    [brand, model, year, price, mileage, description, images, req.params.id]
  );

  res.json({ success: true });
});

app.delete("/api/admin/cars/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

app.post("/api/admin/cars/reorder", requireAdmin, async (req, res) => {
  const { order } = req.body;

  for (let i = 0; i < order.length; i++) {
    await pool.query(
      "UPDATE cars SET position=$1 WHERE id=$2",
      [i + 1, order[i]]
    );
  }

  res.json({ success: true });
});

/* ===== ADMIN STATIC (LAST!) ===== */
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
