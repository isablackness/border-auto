const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== ADMIN AUTH ===== */
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Auth required");
  }

  const [type, encoded] = auth.split(" ");
  const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");

  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();

  res.set("WWW-Authenticate", 'Basic realm="Admin Area"');
  res.status(401).send("Invalid credentials");
}

/* ===== CLOUDINARY ===== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ===== DATABASE ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    brand TEXT,
    model TEXT,
    year INT,
    price INT,
    mileage INT,
    description TEXT,
    images JSONB
  )
`);

/* ===== UPLOAD ===== */
const upload = multer({ storage: multer.memoryStorage() });

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(express.static("public"));
app.use("/admin", adminAuth, express.static("admin"));

/* ===== API ===== */
app.get("/api/cars", async (req, res) => {
  const result = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  res.json(result.rows);
});

app.post(
  "/api/cars",
  adminAuth,
  upload.array("images", 10),
  async (req, res) => {
    const imageUrls = [];

    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "border-auto" }
      );
      imageUrls.push(uploadResult.secure_url);
    }

    const { brand, model, year, price, mileage, description } = req.body;

    await pool.query(
      `INSERT INTO cars (brand, model, year, price, mileage, description, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [brand, model, year, price, mileage, description, imageUrls]
    );

    res.json({ success: true });
  }
);

app.listen(PORT, () => {
  console.log("🚀 Server running with image upload");
});
