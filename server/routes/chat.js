// ============================================================
// VALCRION — CHAT ROUTES  /api/chat
// ============================================================
const router = require("express").Router();
const { getDB } = require("../db");
const { authMiddleware } = require("../middleware/auth");

// GET /api/chat/:projectId — get messages for a project
router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const db       = getDB();
    const messages = await db.collection("vl_chat")
      .find({ projectId: req.params.projectId })
      .sort({ timestamp: 1 })
      .toArray();
    res.json(messages.map(m => ({ ...m, id: m._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — send a message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, content } = req.body;
    if (!projectId || !content) return res.status(400).json({ error: "projectId and content required" });

    const db  = getDB();
    const msg = {
      projectId,
      senderId:   req.user.id,
      senderRole: req.user.role,
      content,
      timestamp:  new Date().toISOString(),
      read:       false,
    };

    const result = await db.collection("vl_chat").insertOne(msg);
    res.status(201).json({ ...msg, id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
