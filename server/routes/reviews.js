const router  = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/reviews — public approved reviews
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const reviews = await db.collection("vl_reviews")
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(reviews.map(r => ({ ...r, id: r._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reviews/all — admin only, all reviews
router.get("/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    const reviews = await db.collection("vl_reviews")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(reviews.map(r => ({ ...r, id: r._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reviews — submit review (auth required)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, rating, text, role } = req.body;
    if (!name || !rating || !text) return res.status(400).json({ error: "All fields required" });
    const db = getDB();
    const result = await db.collection("vl_reviews").insertOne({
      name, rating: Number(rating), text,
      role: role || "Client",
      approved: false,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: result.insertedId.toString(), success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/reviews/:id/approve — admin only
router.patch("/:id/approve", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    await db.collection("vl_reviews").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { approved: true } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/reviews/:id — admin only
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    await db.collection("vl_reviews").deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
