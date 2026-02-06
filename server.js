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
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "car load failed" });
  }
});

/* ================================================= */
/* ============== INSTAGRAM MANUAL IMPORT =========== */
/* ================================================= */

/**
 * Приводим URL к каноническому виду /p/{code}/
 */
function normalizeInstagramUrl(url) {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?p\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  return `https://www.instagram.com/p/${m[1]}/`;
}

/**
 * Парсер Instagram с fallback
 */
async function importInstagramPost(url) {
  const normalizedUrl = normalizeInstagramUrl(url);
  if (!normalizedUrl) {
    throw new Error("Неверный формат ссылки Instagram");
  }

  const response = await fetch(normalizedUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow"
  });

  const html = await response.text();

  /* ===== 1. Пытаемся ld+json ===== */
  const ldMatch = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s
  );

  if (ldMatch) {
    const data = JSON.parse(ldMatch[1]);

    const caption = data.caption || "";
    const images = Array.isArray(data.image)
      ? data.image
      : [data.image];

    return await uploadImages(caption, images);
  }

  /* ===== 2. Fallback: window._sharedData ===== */
  const sharedMatch = html.match(
    /window\._sharedData\s*=\s*(\{.*?\});<\/script>/s
  );

  if (sharedMatch) {
    const sharedData = JSON.parse(sharedMatch[1]);

    const media =
      sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

    if (!media) {
      throw new Error("Не удалось извлечь данные из sharedData");
    }

    const caption =
      media.edge_media_to_caption?.edges?.[0]?.node?.text || "";

    const images = [];

    if (media.edge_sidecar_to_children) {
      media.edge_sidecar_to_children.edges.forEach(e => {
        images.push(e.node.display_url);
      });
    } else if (media.display_url) {
      images.push(media.display_url);
    }

    return await uploadImages(caption, images);
  }

  /* ===== 3. Ничего не нашли — логируем ===== */
  console.error("Instagram HTML length:", html.length);
  console.error("Instagram HTML preview:", html.slice(0, 300));

  throw new Error("Не удалось распарсить страницу Instagram");
}

/**
 * Загрузка изображений в Cloudinary
 */
async function uploadImages(caption, images) {
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
    if (!url) {
      return res.status(400).json({ error: "Нет ссылки" });
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
    res.status(500).json({ error: e.message });
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
