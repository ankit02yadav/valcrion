// ============================================================
// VALCRION — CONTACT ROUTES  /api/contact
// ============================================================
const router = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/contact — admin only
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db   = getDB();
    const subs = await db.collection("vl_contact").find({}).sort({ submittedAt: -1 }).toArray();
    res.json(subs.map(s => ({ ...s, id: s._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contact — public
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "Name, email and message required" });

    const db  = getDB();
    const sub = {
      name, email,
      subject:     subject || "",
      message,
      submittedAt: new Date().toISOString(),
      read:        false,
    };

    const result = await db.collection("vl_contact").insertOne(sub);
    res.status(201).json({ ...sub, id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contact/:id/read — mark as read
router.patch("/:id/read", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    await db.collection("vl_contact").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
