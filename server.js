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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

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

/* ===== PUBLIC API ===== */
app.get("/api/cars", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM cars ORDER BY position ASC"
  );
  res.json(r.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM cars WHERE id=$1",
    [req.params.id]
  );
  res.json(r.rows[0]);
});

/* ===== CLOUDINARY UPLOAD ===== */
app.post("/api/admin/upload", requireAdmin, async (req, res) => {
  const { images } = req.body;
  const uploaded = [];

  for (const base64 of images) {
    const result = await cloudinary.uploader.upload(base64, {
      folder: "border-auto"
    });
    uploaded.push(result.secure_url);
  }

  res.json(uploaded);
});

/* ===== ADMIN CARS CRUD ===== */
app.post("/api/admin/cars", requireAdmin, async (req, res) => {
  const { brand, model, year, price, mileage, description, images } = req.body;

  await pool.query(
    `
    INSERT INTO cars
    (brand, model, year, price, mileage, description, images, position)
    VALUES ($1,$2,$3,$4,$5,$6,$7,
      (SELECT COALESCE(MAX(position),0)+1 FROM cars)
    )
    `,
    [brand, model, year, price, mileage, description, images]
  );

  res.json({ ok: true });
});

app.put("/api/admin/cars/:id", requireAdmin, async (req, res) => {
  const { brand, model, year, price, mileage, description, images } = req.body;

  await pool.query(
    `
    UPDATE cars SET
      brand=$1,
      model=$2,
      year=$3,
      price=$4,
      mileage=$5,
      description=$6,
      images=$7
    WHERE id=$8
    `,
    [brand, model, year, price, mileage, description, images, req.params.id]
  );

  res.json({ ok: true });
});

app.delete("/api/admin/cars/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

/* ===== SORT CARS ===== */
app.post("/api/admin/cars/sort", requireAdmin, async (req, res) => {
  const { order } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (let i = 0; i < order.length; i++) {
      await client.query(
        "UPDATE cars SET position = $1 WHERE id = $2",
        [i, order[i]]
      );
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "sort failed" });
  } finally {
    client.release();
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

/* ===== ADMIN LOGOUT ===== */
app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login.html");
  });
});

/* ===== ADMIN CHECK ===== */
app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

/* ================================================= */
/* ========== INSTAGRAM IMPORT BLOCK ================ */
/* ================================================= */

async function fetchInstagramPosts() {
  const url =
    `https://graph.instagram.com/${process.env.INSTAGRAM_USER_ID}/media` +
    `?fields=id,caption,media_url,media_type` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const r = await fetch(url);
  const data = await r.json();
  return data.data || [];
}

function parseCaption(caption = "") {
  const lines = caption.split("\n").map(l => l.trim()).filter(Boolean);

  return {
    brand: lines[0] || "",
    model: lines[1] || "",
    year: Number(lines[2]) || null,
    price: Number(
      lines.find(l => l.includes("€"))?.replace(/\D/g, "")
    ) || null,
    mileage: Number(
      lines.find(l => l.toLowerCase().includes("km"))?.replace(/\D/g, "")
    ) || null,
    description: caption
  };
}

app.post("/api/admin/instagram/import", requireAdmin, async (req, res) => {
  const posts = await fetchInstagramPosts();

  for (const post of posts) {
    if (post.media_type !== "IMAGE") continue;

    const parsed = parseCaption(post.caption);

    await pool.query(
      `
      INSERT INTO instagram_drafts
      (instagram_post_id, brand, model, year, price, mileage, description, images)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (instagram_post_id) DO NOTHING
      `,
      [
        post.id,
        parsed.brand,
        parsed.model,
        parsed.year,
        parsed.price,
        parsed.mileage,
        parsed.description,
        [post.media_url]
      ]
    );
  }

  res.json({ ok: true });
});

/* ===== ADMIN STATIC ===== */
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
