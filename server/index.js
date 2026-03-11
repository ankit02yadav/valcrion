require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { connectDB } = require("./db");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/users",    require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/chat",     require("./routes/chat"));
app.use("/api/blog",     require("./routes/blog"));
app.use("/api/jobs",     require("./routes/jobs"));
app.use("/api/contact",  require("./routes/contact"));
app.use("/api/reviews",  require("./routes/reviews"));
app.use("/api/hosting",  require("./routes/hosting"));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Valcrion API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err.message);
    process.exit(1);
  }
}
start();
