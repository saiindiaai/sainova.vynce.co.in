import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import launcherRoutes from "./routes/launcher.routes.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Message to remove "Cannot GET /"
app.get("/", (req, res) => {
  res.send("🚀 Vynce backend is live and connected to MongoDB!");
});

// Routes
app.use("/api/launcher", launcherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vynce backend running on port ${PORT}`));
