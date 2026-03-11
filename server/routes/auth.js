// ============================================================
// VALCRION — AUTH ROUTES  /api/auth
// ============================================================
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { getDB, toObjectId } = require("../db");
const { authMiddleware } = require("../middleware/auth");

function makeToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const db   = getDB();
    const user = await db.collection("vl_users").findOne({ email: email.toLowerCase() });

    if (!user)             return res.status(401).json({ error: "Invalid email or password" });
    if (!user.isActive)    return res.status(403).json({ error: "Account is disabled" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)            return res.status(401).json({ error: "Invalid email or password" });

    const token = makeToken(user);
    const { password: _, ...safeUser } = user;

    res.json({ token, user: { ...safeUser, id: user._id.toString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register  (clients only — devs apply via /api/jobs)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 6)          return res.status(400).json({ error: "Password must be at least 6 characters" });

    const db = getDB();
    const existing = await db.collection("vl_users").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email:     email.toLowerCase(),
      password:  hashed,
      role:      "client",
      isActive:  true,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("vl_users").insertOne(newUser);
    newUser._id  = result.insertedId;

    const token = makeToken(newUser);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({ token, user: { ...safeUser, id: newUser._id.toString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

    const db   = getDB();
    const user = await db.collection("vl_users").findOne({ _id: toObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.collection("vl_users").updateOne(
      { _id: toObjectId(req.user.id) },
      { $set: { password: hashed, updatedAt: new Date().toISOString() } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
