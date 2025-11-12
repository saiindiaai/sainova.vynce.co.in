import express from 'express';
import App from '../models/App.js';
const router = express.Router();

// mock apps for now
const defaultApps = [
  { id: 'social', name: 'Vynce Social', active: true },
  { id: 'connect', name: 'Vynce Connect', active: false },
  { id: 'promptane', name: 'Promptane', active: true }
];

router.get('/available', async (req, res) => {
  try {
    const apps = await App.find();
    if (apps.length === 0) return res.json(defaultApps);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
