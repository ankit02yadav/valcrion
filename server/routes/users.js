// ============================================================
// VALCRION — USER ROUTES  /api/users
// ============================================================
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/users — all users (admin only)
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db    = getDB();
    const users = await db.collection("vl_users")
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json(users.map(u => ({ ...u, id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/developer — admin adds a developer
router.post("/developer", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    const db = getDB();
    const existing = await db.collection("vl_users").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newDev  = {
      name,
      email:     email.toLowerCase(),
      password:  hashed,
      role:      "developer",
      isActive:  true,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("vl_users").insertOne(newDev);
    res.status(201).json({ id: result.insertedId.toString(), ...newDev, password: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/toggle — enable/disable user (admin only)
router.patch("/:id/toggle", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db   = getDB();
    const user = await db.collection("vl_users").findOne({ _id: toObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: "User not found" });

    await db.collection("vl_users").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { isActive: !user.isActive } }
    );
    res.json({ success: true, isActive: !user.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (admin only)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    await db.collection("vl_users").deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
