const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const session = require("express-session");
const cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== DB ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== CLOUDINARY ===== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

/* ===== AUTH ===== */
const requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  res.status(401).json({ error: "unauthorized" });
};

/* ===== ADMIN CHECK (КРИТИЧЕСКИ ВАЖНО) ===== */
app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

/* ================= INSTAGRAM MANUAL IMPORT ================= */

async function importInstagramPost(url) {
  const html = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  }).then(r => r.text());

  const jsonMatch = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s
  );
  if (!jsonMatch) throw new Error("Не удалось найти данные поста");

  const data = JSON.parse(jsonMatch[1]);

  const caption = data.caption || "";
  const images = Array.isArray(data.image) ? data.image : [data.image];

  const uploadedImages = [];

  for (const img of images) {
    const result = await cloudinary.uploader.upload(img, {
      folder: "instagram-import"
    });
    uploadedImages.push(result.secure_url);
  }

  return { caption, images: uploadedImages };
}

app.post("/api/admin/instagram/import", requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.includes("instagram.com/p/")) {
      return res.status(400).json({ error: "Неверная ссылка" });
    }

    const post = await importInstagramPost(url);

    await pool.query(
      `
      INSERT INTO instagram_drafts (description, images)
      VALUES ($1,$2)
      `,
      [post.caption, post.images]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка импорта" });
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
