import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
async function init() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");

    // USER COLLECTION INDEXES
    await mongoose.connection.collection("users").createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { vuid: 1 }, unique: true },
      { key: { email: 1 } },
    ]);

    // SESSION COLLECTION INDEXES
    await mongoose.connection.collection("sessions").createIndex(
      { userId: 1, expiresAt: 1 }
    );

    console.log("All indexes created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Index creation failed:", err);
    process.exit(1);
  }
}

init();
