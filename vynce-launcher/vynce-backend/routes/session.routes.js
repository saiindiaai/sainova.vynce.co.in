import express from "express";
import { clientLog } from "../controllers/session.controller.js";

const router = express.Router();

router.post("/logs/client", clientLog);

export default router;
