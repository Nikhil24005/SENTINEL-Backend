import express from 'express';
import Incident from '../models/Incident.js';
import IncidentEvent from '../models/IncidentEvent.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateSeverity, assignResponders } from '../services/decisionEngine.js';

const router = express.Router();

// Create help request from zone
router.post('/:zoneId', async (req, res) => {
  try {
    const { emergencyType, message, facilityId, floorId } = req.body;
    const { zoneId } = req.params;

    const { severity, riskScore } = await calculateSeverity({ type: emergencyType });

    const incident = new Incident({
      id: uuidv4(),
      facilityId,
      floorId,
      zoneId,
      type: emergencyType,
      severity,
      status: 'new',
      source: 'qr_help',
      riskScore,
      description: message || `Help request: ${emergencyType}`,
    });

    const savedIncident = await incident.save();

    // Create event
    const event = new IncidentEvent({
      id: uuidv4(),
      incidentId: savedIncident._id,
      type: 'help_request',
      message: `Help request submitted from zone: ${message}`,
      metadata: { source: 'qr_help' },
    });
    await event.save();

    // Auto-assign responders
    const assignments = await assignResponders(incident, savedIncident._id);

    res.status(201).json({
      success: true,
      incident: savedIncident,
      assignments,
      message: 'Help request received. Responders are on their way.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
