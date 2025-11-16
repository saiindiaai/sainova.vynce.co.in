import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const JWT_EXP = process.env.JWT_EXP || '15m';
const REFRESH_EXP = process.env.REFRESH_EXP || '30d';

export function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });
}
export function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}
export function verifyAccess(token) {
  return jwt.verify(token, JWT_SECRET);
}
export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export function generateVUID() {
  // 9-digit numeric UID; repeat if collision (check in DB)
  return Math.floor(100_000_000 + Math.random() * 900_000_000).toString();
}
