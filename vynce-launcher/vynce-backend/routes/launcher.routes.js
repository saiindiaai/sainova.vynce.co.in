import express from "express";
import { getLauncherConfig } from "../controllers/launcher.controller.js";

const router = express.Router();

router.get("/config", getLauncherConfig);

export default router;
