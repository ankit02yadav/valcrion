const router = require("express").Router();
const { getDB, toObjectId } = require("../db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const PLAN_BASE = {
  frontendOnly: 4999,
  backendHeavy: 7999,
  fullStack:    14999,
  fullDetailed: 24999,
};

const SERVICE_FEE = {
  frontendOnly: { hosting: 999,  zip: 499  },
  backendHeavy: { hosting: 1499, zip: 699  },
  fullStack:    { hosting: 1999, zip: 999  },
  fullDetailed: { hosting: 2999, zip: 1499 },
};

function calcPrice(plan, type) {
  const base = PLAN_BASE[plan] || 4999;
  const fee  = SERVICE_FEE[plan]?.[type] || 999;
  // Both ZIP and Hosting charge plan price + service fee
  return base + fee;
}

// GET /api/hosting
router.get("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const query = req.user.role === "admin" ? {} : { clientId: req.user.id };
    const requests = await db.collection("vl_hosting").find(query).sort({ createdAt: -1 }).toArray();
    res.json(requests.map(r => ({ ...r, id: r._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/hosting — client submits
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, projectTitle, plan, type } = req.body;
    if (!projectId || !plan || !type) return res.status(400).json({ error: "Missing fields" });
    const db = getDB();
    const price = calcPrice(plan, type);

    // Grab codeLink from project (set by dev when submitting for review)
    const project = await db.collection("vl_projects").findOne({ _id: toObjectId(projectId) });
    const codeLink = project?.codeLink || "";

    const request = {
      clientId: req.user.id,
      clientName: req.user.name,
      projectId, projectTitle, plan, type, price,
      codeLink,  // store for admin to use during delivery
      status: "pending_payment",
      paymentConfirmed: false,
      deliveryLink: "",
      credentials: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection("vl_hosting").insertOne(request);
    res.status(201).json({ ...request, id: result.insertedId.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/hosting/:id — admin updates
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    const body = req.body;

    // When confirming payment for ZIP type, auto-fill deliveryLink from codeLink
    if (body.status === "in_progress" || body.paymentConfirmed) {
      const existing = await db.collection("vl_hosting").findOne({ _id: toObjectId(req.params.id) });
      if (existing && existing.type === "zip" && existing.codeLink && !existing.deliveryLink) {
        body.deliveryLink = existing.codeLink;
        body.status = "delivered"; // ZIP: auto-deliver immediately after payment confirmed
      }
    }

    await db.collection("vl_hosting").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { ...body, updatedAt: new Date().toISOString() } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
