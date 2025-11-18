import express from "express";
import {
  createVuid,
  checkUsername,
  setUserIdentity,
  verifyAge,
  refreshAccessToken,
  validateSession,
  createGuestAccount,
  convertGuestAccount
} from "../controllers/auth.controller.js";

const router = express.Router();

// Step 1: Create VUID
router.post("/uid", createVuid);

// Step 2: Username availability
router.post("/check-username", checkUsername);

// Step 2 Final: Set username + display name
router.post("/set-identity", setUserIdentity);

// Step 3: Age verification
router.post("/verify-age", verifyAge);

router.post("/guest", createGuestAccount);
router.post("/convert", convertGuestAccount);

// Session
router.post("/refresh", refreshAccessToken);
router.post("/validate", validateSession);

export default router;
