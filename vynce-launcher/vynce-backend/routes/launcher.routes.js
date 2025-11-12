import express from "express";
const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    maintenance: false,
    latestVersion: "1.0.0",
    ecosystemTitle: "Vynce Ecosystem",
    apps: [
      { id: "social", name: "Vynce Social", description: "Express. Share. Connect.", icon: "💬", users: "2.5M", rating: 4.8, gradient: "from-blue-500 to-purple-600" },
      { id: "connect", name: "Vynce Connect", description: "Where meaningful connections begin.", icon: "🤝", users: "1.8M", rating: 4.9, gradient: "from-pink-500 to-rose-600" },
      { id: "promptane", name: "Promptane", description: "Power your imagination.", icon: "✨", users: "3.2M", rating: 4.7, gradient: "from-cyan-500 to-blue-600" }
    ],
  });
});

export default router;
