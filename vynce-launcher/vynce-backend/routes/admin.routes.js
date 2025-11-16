import express from "express";
import { getLiveUsers, getEvents } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/live-users", getLiveUsers);
router.get("/events", getEvents);

export default router;
