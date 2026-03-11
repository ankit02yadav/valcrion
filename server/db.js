// ============================================================
// VALCRION — MONGODB CONNECTION
// ============================================================
const { MongoClient, ObjectId } = require("mongodb");

const uri    = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "valcrion";

let client;
let db;

async function connectDB() {
  if (db) return db; // already connected
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`📂 Connected to database: ${dbName}`);

  // Create indexes for better performance
  await db.collection("vl_users").createIndex({ email: 1 }, { unique: true });
  await db.collection("vl_chat").createIndex({ projectId: 1 });
  await db.collection("vl_blog").createIndex({ slug: 1 }, { unique: true });
  await db.collection("vl_projects").createIndex({ clientId: 1 });

  // Seed admin if not exists
  await seedAdmin();
  await seedDummyReview();

  return db;
}

function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

// Seed default admin account
async function seedAdmin() {
  const bcrypt = require("bcryptjs");
  const users  = db.collection("vl_users");
  const exists = await users.findOne({ role: "admin" });
  if (!exists) {
    const hashed = await bcrypt.hash("admin123", 10);
    await users.insertOne({
      name:      "Ankit Yadav",
      email:     "admin@valcrion.com",
      password:  hashed,
      role:      "admin",
      isActive:  true,
      createdAt: new Date().toISOString(),
    });
    console.log("👤 Admin account seeded: admin@valcrion.com / admin123");
  }
}

// Seed a dummy approved review so homepage shows something
async function seedDummyReview() {
  const reviews = db.collection("vl_reviews");
  const count = await reviews.countDocuments();
  if (count === 0) {
    await reviews.insertMany([
      {
        name: "Rahul M.",
        rating: 5,
        text: "Valcrion delivered my e-commerce site in under 2 weeks. The entire process was smooth, communication was great through the chat, and the final product exceeded my expectations. Highly recommend!",
        role: "E-commerce Client",
        approved: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Priya S.",
        rating: 5,
        text: "I was skeptical about the anonymous model at first, but it actually works brilliantly. My SaaS dashboard was built exactly to spec. Will definitely use Valcrion again.",
        role: "SaaS Founder",
        approved: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        name: "Arjun K.",
        rating: 4,
        text: "Great experience overall. The developer was responsive and professional. The platform makes collaboration really easy even without direct contact.",
        role: "Startup Client",
        approved: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
    console.log("⭐ Dummy reviews seeded");
  }
}

// Helper — convert string id to ObjectId safely
function toObjectId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

module.exports = { connectDB, getDB, toObjectId };
