import express from 'express';
import crypto from 'crypto';
import Session from '../models/Session.js';
const router = express.Router();

router.post('/session', async (req, res) => {
  try {
    const { userId, acceptedTerms } = req.body;
    if (!userId || !acceptedTerms)
      return res.status(400).json({ error: 'Missing fields' });

    const token = crypto.randomUUID();
    const session = await Session.create({ userId, token, acceptedTerms });
    res.json({ message: 'Session created', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
