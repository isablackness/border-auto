const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 10000;

/* ================= DB ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    name: "border-auto-admin",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

/* ================= HEALTH ================= */
app.get("/health", (_, res) => res.send("ok"));

/* ================= AUTH ================= */
const requireAdmin = (req, res, next) => {
  if (req.session?.isAdmin) return next();
  return res.status(401).json({ error: "unauthorized" });
};

/* ================= ROOT ================= */
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

/* ================= ADMIN ================= */
app.post("/admin/login", (req, res) => {
  const { login, password } = req.body;

  if (
    login === process.env.ADMIN_LOGIN &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    return res.redirect("/admin/");
  }

  res.status(401).send("Неверный логин или пароль");
});

app.get("/api/admin/check", requireAdmin, (_, res) => {
  res.json({ ok: true });
});

app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ================= PUBLIC CARS ================= */
app.get("/api/cars", async (_, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM cars ORDER BY position DESC"
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "cars load failed" });
  }
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM cars WHERE id=$1",
      [req.params.id]
    );
    res.json(r.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "car load failed" });
  }
});

/* ================= ADMIN CARS ================= */
app.put("/api/admin/cars/:id", requireAdmin, async (req, res) => {
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
        brand=$1,
        model=$2,
        year=$3,
        price=$4,
        mileage=$5,
        gearbox=$6,
        description=$7,
        images=$8
      WHERE id=$9
      RETURNING *
      `,
      [
        brand,
        model,
        year,
        price,
        mileage,
        gearbox,
        description,
        images,
        req.params.id
      ]
    );

    if (!r.rowCount) {
      return res.status(404).json({ error: "car not found" });
    }

    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "car update failed" });
  }
});

app.delete("/api/admin/cars/:id", requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM cars WHERE id=$1 RETURNING id",
      [req.params.id]
    );

    if (!r.rowCount) {
      return res.status(404).json({ error: "car not found" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "car delete failed" });
  }
});

/* ================= INSTAGRAM ================= */
app.post("/api/admin/instagram/import", requireAdmin, async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ error: "Неверная ссылка Instagram" });
  }

  try {
    await pool.query(
      "INSERT INTO instagram_drafts (source_url) VALUES ($1)",
      [url]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка сохранения ссылки" });
  }
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
