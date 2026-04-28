import express from 'express';
import { simulateIncident, createDrillRun, addDrillEvent, completeDrillRun, getDrillReport } from '../services/simulation.js';
import DrillRun from '../models/DrillRun.js';
import Incident from '../models/Incident.js';

const router = express.Router();

// Simulate incident
router.post('/simulate', async (req, res) => {
  try {
    const { facilityId, zoneId, incidentType } = req.body;

    const incident = await simulateIncident(facilityId, zoneId, incidentType);

    res.status(201).json({
      success: true,
      incident,
      message: `Simulation started: ${incidentType}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get simulation presets
router.get('/presets', async (req, res) => {
  const presets = [
    {
      id: 'fire_foodcourt',
      name: 'Fire in Food Court',
      facility: 'mall',
      zone: 'Food Court',
      type: 'fire',
      description: 'Simulates a fire emergency in the food court area',
    },
    {
      id: 'medical_gate',
      name: 'Medical Emergency at Gate',
      facility: 'stadium',
      zone: 'South Gate',
      type: 'medical',
      description: 'Guest collapses near stadium entrance',
    },
    {
      id: 'crowd_surge',
      name: 'Crowd Surge at Entry',
      facility: 'stadium',
      zone: 'Main Field',
      type: 'crowd_surge',
      description: 'Dangerous crowd density detected',
    },
    {
      id: 'panic_corridor',
      name: 'Panic Button in Hotel',
      facility: 'hotel',
      zone: 'Corridor A',
      type: 'panic_button',
      description: 'Security emergency triggered',
    },
    {
      id: 'gas_leak',
      name: 'Gas Leak Detected',
      facility: 'mall',
      zone: 'Main Corridor',
      type: 'gas_leak',
      description: 'Gas sensor alarm in main corridor',
    },
  ];

  res.json(presets);
});

// Create drill run
router.post('/drills', async (req, res) => {
  try {
    const { facilityId, scenario } = req.body;
    const drillRun = await createDrillRun(facilityId, scenario);
    res.status(201).json(drillRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all drills
router.get('/drills', async (req, res) => {
  try {
    const drills = await DrillRun.find().sort({ startedAt: -1 });
    res.json(drills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get drill by ID
router.get('/drills/:id', async (req, res) => {
  try {
    const drill = await DrillRun.findById(req.params.id);
    const incidents = await Incident.find({ _id: { $in: drill.incidentIds } });
    res.json({ drill, incidents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete drill
router.post('/drills/:id/complete', async (req, res) => {
  try {
    const drill = await completeDrillRun(req.params.id);
    res.json(drill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add event to drill
router.post('/drills/:id/events', async (req, res) => {
  try {
    const { message, type } = req.body;
    const drillRun = await addDrillEvent(req.params.id, { message, type });
    res.json(drillRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
