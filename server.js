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

/* ===== MIDDLEWARE ===== */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    name: "border-auto-admin",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

/* ===== AUTH ===== */
const requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  res.status(401).json({ error: "unauthorized" });
};

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

/* ===== ADMIN CHECK ===== */
app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

/* ================================================= */
/* ================== PUBLIC CARS API ============== */
/* ================================================= */

app.get("/api/cars", async (req, res) => {
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

/* ===== DELETE CAR (PUBLIC) ===== */
app.delete("/api/cars/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const r = await pool.query(
      "DELETE FROM cars WHERE id=$1 RETURNING id",
      [id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ error: "car not found" });
    }

    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "car delete failed" });
  }
});

/* ================================================= */
/* ========== INSTAGRAM: SOURCE ONLY (NO PARSE) ===== */
/* ================================================= */

app.post("/api/admin/instagram/import", requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes("instagram.com")) {
      return res.status(400).json({ error: "Неверная ссылка Instagram" });
    }

    await pool.query(
      `
      INSERT INTO instagram_drafts (source_url)
      VALUES ($1)
      `,
      [url]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка сохранения ссылки" });
  }
});

/* ===== ADMIN LOGIN ===== */
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

/* ===== ADMIN STATIC ===== */
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
