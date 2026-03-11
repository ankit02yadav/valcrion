// ============================================================
// VALCRION — JOB ROUTES  /api/jobs
// ============================================================
const router = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/jobs — admin only
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db   = getDB();
    const jobs = await db.collection("vl_jobs").find({}).sort({ appliedAt: -1 }).toArray();
    res.json(jobs.map(j => ({ ...j, id: j._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs — public, anyone can apply
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, skills, experience, portfolioUrl, githubUrl, cvUrl, coverLetter } = req.body;
    if (!name || !email || !skills || !experience || !coverLetter) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const db  = getDB();
    const app = {
      name,
      email,
      phone:        phone || "",
      skills:       Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()),
      experience,
      portfolioUrl: portfolioUrl || "",
      githubUrl:    githubUrl || "",
      cvUrl:        cvUrl || "",          // ← save whatever the user submitted
      coverLetter,
      status:       "pending",
      appliedAt:    new Date().toISOString(),
    };

    const result = await db.collection("vl_jobs").insertOne(app);
    res.status(201).json({ ...app, id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/jobs/:id/status — admin updates application status
router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const db = getDB();
    await db.collection("vl_jobs").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { status } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
