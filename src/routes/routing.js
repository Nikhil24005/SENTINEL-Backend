import express from 'express';
import { generateEvacuationRoute, generateResponderRoute, findNearestAED } from '../services/routing.js';

const router = express.Router();

// Generate evacuation route
router.post('/evacuation', async (req, res) => {
  try {
    const { fromZoneId, floorId } = req.body;

    const route = await generateEvacuationRoute(fromZoneId, floorId);

    if (!route) {
      return res.status(404).json({ error: 'No route found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate responder route
router.post('/responder', async (req, res) => {
  try {
    const { fromZoneId, toZoneId, floorId } = req.body;

    const route = await generateResponderRoute(fromZoneId, toZoneId, floorId);

    if (!route) {
      return res.status(404).json({ error: 'No route found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find nearest AED
router.post('/nearest-aed', async (req, res) => {
  try {
    const { zoneId, floorId } = req.body;

    const aed = await findNearestAED(zoneId, floorId);

    if (!aed) {
      return res.status(404).json({ error: 'No AED found nearby' });
    }

    res.json(aed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
