// ============================================================
// VALCRION — BLOG ROUTES  /api/blog
// ============================================================
const router = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/blog — public (published only) or all for admin
router.get("/", async (req, res) => {
  try {
    const db    = getDB();
    const query = req.query.all === "true" ? {} : { published: true };
    const posts = await db.collection("vl_blog").find(query).sort({ publishedAt: -1 }).toArray();
    res.json(posts.map(p => ({ ...p, id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blog — admin creates post
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });

    const db   = getDB();
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const post = {
      title, excerpt, content,
      slug,
      tags:        tags || [],
      authorId:    req.user.id,
      published:   published ?? true,
      publishedAt: new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    const result = await db.collection("vl_blog").insertOne(post);
    res.status(201).json({ ...post, id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blog/:id — admin only
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    await db.collection("vl_blog").deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
