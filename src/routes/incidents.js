import express from 'express';
import Incident from '../models/Incident.js';
import IncidentEvent from '../models/IncidentEvent.js';
import Assignment from '../models/Assignment.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateSeverity, assignResponders, calculateZoneRiskScores } from '../services/decisionEngine.js';
import { broadcastNotification } from '../services/notifications.js';

const router = express.Router();

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('zoneId')
      .populate('facilityId')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incident by ID with all related data
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('zoneId')
      .populate('facilityId')
      .populate('floorId');

    const events = await IncidentEvent.find({ incidentId: incident._id }).sort({ timestamp: 1 });
    const assignments = await Assignment.find({ incidentId: incident._id }).populate('userId');

    res.json({
      ...incident.toObject(),
      events,
      assignments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create manual incident
router.post('/', async (req, res) => {
  try {
    const { facilityId, floorId, zoneId, type, description } = req.body;

    const { severity, riskScore } = await calculateSeverity({ type });

    const incident = new Incident({
      id: uuidv4(),
      facilityId,
      floorId,
      zoneId,
      type,
      severity,
      status: 'new',
      source: 'manual',
      riskScore,
      description,
    });

    const savedIncident = await incident.save();

    // Create event
    const event = new IncidentEvent({
      id: uuidv4(),
      incidentId: savedIncident._id,
      type: 'created',
      message: `${type} incident created`,
    });
    await event.save();

    // Auto-assign responders
    const assignments = await assignResponders(incident, savedIncident._id);
    for (const assignment of assignments) {
      const assigned = new Assignment({
        id: uuidv4(),
        incidentId: savedIncident._id,
        ...assignment,
      });
      await assigned.save();
    }

    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge incident
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      },
      { new: true }
    );

    const event = new IncidentEvent({
      id: uuidv4(),
      incidentId: incident._id,
      type: 'acknowledged',
      message: 'Incident acknowledged by control room',
    });
    await event.save();

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update incident status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      },
      { new: true }
    );

    const event = new IncidentEvent({
      id: uuidv4(),
      incidentId: incident._id,
      type: 'status_changed',
      message: `Status changed to ${status}`,
      metadata: { newStatus: status },
    });
    await event.save();

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incidents by facility
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const incidents = await Incident.find({ facilityId: req.params.facilityId })
      .populate('zoneId')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active incidents
router.get('/status/active', async (req, res) => {
  try {
    const incidents = await Incident.find({
      status: { $ne: 'resolved' },
    })
      .populate('zoneId')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
