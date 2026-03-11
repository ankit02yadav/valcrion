// ============================================================
// VALCRION — PROJECT ROUTES  /api/projects
// ============================================================
const router = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/projects — filtered by role
router.get("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    let query = {};
    if (req.user.role === "client")    query = { clientId: req.user.id };
    if (req.user.role === "developer") query = { developerId: req.user.id };
    const projects = await db.collection("vl_projects").find(query).sort({ createdAt: -1 }).toArray();
    res.json(projects.map(p => ({ ...p, id: p._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/projects — client creates project
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "client") return res.status(403).json({ error: "Clients only" });
    const { title, description, plan } = req.body;
    if (!title || !description || !plan) return res.status(400).json({ error: "All fields required" });

    const db = getDB();
    const newProject = {
      clientId:       req.user.id,
      developerId:    null,
      title, description, plan,
      status:         "pending",
      documents:      [],
      demoLink:       "",
      clientApproved: false,
      clientRating:   null,
      clientFeedback: "",
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    };
    const result = await db.collection("vl_projects").insertOne(newProject);
    res.status(201).json({ ...newProject, id: result.insertedId.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/projects/:id — update project fields
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const allowed = {};
    const body   = req.body;

    if (req.user.role === "admin") {
      // Admin can set anything
      Object.assign(allowed, body);
    } else if (req.user.role === "developer") {
      // Dev can update status, demoLink
      if (body.status)   allowed.status   = body.status;
      if (body.demoLink  !== undefined) allowed.demoLink  = body.demoLink;
      if (body.codeLink  !== undefined) allowed.codeLink  = body.codeLink;
    } else if (req.user.role === "client") {
      // Client can approve + leave rating/feedback
      if (body.clientApproved !== undefined) allowed.clientApproved = body.clientApproved;
      if (body.clientRating   !== undefined) allowed.clientRating   = body.clientRating;
      if (body.clientFeedback !== undefined) allowed.clientFeedback = body.clientFeedback;
      if (body.status)                       allowed.status         = body.status;
    }

    allowed.updatedAt = new Date().toISOString();

    await db.collection("vl_projects").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: allowed }
    );

    // Auto-create a pending review when client submits rating
    if (req.user.role === "client" && body.clientRating && body.clientFeedback) {
      try {
        const project = await db.collection("vl_projects").findOne({ _id: toObjectId(req.params.id) });
        const alreadyReviewed = await db.collection("vl_reviews").findOne({ projectId: req.params.id });
        if (!alreadyReviewed && project) {
          await db.collection("vl_reviews").insertOne({
            name: "Verified Client",
            rating: Number(body.clientRating),
            text: body.clientFeedback,
            role: "Verified Client",
            projectId: req.params.id,
            approved: false,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (e) { console.error("Review auto-create failed:", e.message); }
    }

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
