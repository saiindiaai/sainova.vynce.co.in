import User from "../models/User.js"; import Session from 
"../models/Session.js"; import crypto from "crypto";

// Generate VUID
export const createVuid = async (req, res) => {
  const vuid = Math.floor(10000000 + Math.random() * 90000000); // 8-digit UID
  return res.json({ vuid });
};

// Check username
export const checkUsername = async (req, res) => {
  const { username } = req.body;
  const exists = await User.findOne({ username });

  return res.json({ available: !exists });
};

// Set identity
export const setUserIdentity = async (req, res) => {
  const { vuid, username, displayName } = req.body;

  let user = await User.findOne({ vuid });
  if (!user) user = new User({ vuid });

  user.username = username;
  user.displayName = displayName;
  await user.save();

  return res.json({ success: true, user });
};

// Age verification
export const verifyAge = async (req, res) => {
  const { vuid, age, parentPasskey } = req.body;

  const user = await User.findOne({ vuid });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (age < 13 && !parentPasskey) {
    return res.json({ requiresParent: true });
  }

  user.age = age;
  user.parentPasskey = parentPasskey || null;

  await user.save();

  return res.json({ success: true });
};

// Token refresh
export const refreshAccessToken = async (req, res) => {
  return res.json({ accessToken: crypto.randomUUID() });
};

// Validate session
export const validateSession = async (req, res) => {
  return res.json({ valid: true });
};

// GUEST ACCOUNT
export const createGuestAccount = async (req, res) => {
  const guestVuid = Math.floor(10000000 + Math.random() * 90000000);

  const user = new User({
    vuid: guestVuid,
    isGuest: true,
  });

  await user.save();

  return res.json({
    guestVuid,
    accessToken: crypto.randomUUID(),
    isGuest: true
  });
};


// CONVERT GUEST TO NORMAL USER
export const convertGuestToUser = async (req, res) => {
  const { guestVuid, email, password } = req.body;

  const user = await User.findOne({ vuid: guestVuid });
  if (!user || !user.isGuest) {
    return res.status(400).json({ error: "Invalid guest account" });
  }

  user.email = email;
  user.password = password; // (hash later)
  user.isGuest = false;
  await user.save();

  return res.json({
    success: true,
    converted: true,
    vuid: guestVuid
  });
};
