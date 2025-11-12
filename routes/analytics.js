import express from 'express';
import Analytics from '../models/Analytics.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { event, userId, appId } = req.body;
    await Analytics.create({ event, userId, appId });
    res.json({ status: 'logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
