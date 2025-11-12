import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import launcherRoutes from "./routes/launcher.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not set in environment");
} else {
  mongoose
    .connect(mongoURI)
    .then(() => console.log(`✅ MongoDB connected: ${mongoose.connection.host}`))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

app.use("/api/launcher", launcherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vynce backend running on port ${PORT}`));
