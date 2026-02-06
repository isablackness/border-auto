console.log("ENV CHECK:", {
  ADMIN_LOGIN: process.env.ADMIN_LOGIN,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
});



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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    name: "border-auto-admin",
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

/* ===== API ===== */
app.get("/api/cars", async (req, res) => {
  const result = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  res.json(result.rows);
});

app.get("/api/cars/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM cars WHERE id = $1",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

/* ===== ADMIN AUTH ===== */
const requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  res.redirect("/admin/login.html");
};

/* ===== ADMIN LOGIN PAGE (PUBLIC) ===== */
app.get("/admin/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "login.html"));
});

/* ===== LOGIN HANDLER ===== */
app.post("/admin/login", (req, res) => {
  const { login, password } = req.body;

  if (
    login === process.env.ADMIN_LOGIN &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    return res.redirect("/admin/");
  }

  res.redirect("/admin/login.html?error=1");
});

/* ===== LOGOUT ===== */
app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login.html");
  });
});

/* ===== PROTECTED ADMIN STATIC ===== */
app.use("/admin", requireAdmin, express.static("admin"));


app.post("/api/admin/cars", requireAdmin, async (req, res) => {
  const { brand, model, year, price, mileage, description, images } = req.body;

  await pool.query(
    `
    INSERT INTO cars
    (brand, model, year, price, mileage, description, images)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [brand, model, year, price, mileage, description, images]
  );

  res.json({ success: true });
});


/* ===== START ===== */
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
