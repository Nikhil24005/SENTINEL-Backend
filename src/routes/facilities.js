import express from 'express';
import Facility from '../models/Facility.js';
import Floor from '../models/Floor.js';
import Zone from '../models/Zone.js';
import Asset from '../models/Asset.js';
import Device from '../models/Device.js';
import Edge from '../models/Edge.js';
import Incident from '../models/Incident.js';
import { calculateZoneRiskScores } from '../services/decisionEngine.js';

const router = express.Router();

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get facility with all related data
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    const floors = await Floor.find({ facilityId: req.params.id });
    const zones = await Zone.find({ facilityId: req.params.id });
    const assets = await Asset.find();
    const devices = await Device.find();
    const incidents = await Incident.find({
      facilityId: req.params.id,
      status: { $ne: 'resolved' },
    });

    res.json({
      facility,
      floors,
      zones,
      assets,
      devices,
      activeIncidents: incidents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get facility overview (metrics)
router.get('/:id/overview', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    const incidents = await Incident.find({ facilityId: req.params.id });
    const zones = await Zone.find({ facilityId: req.params.id });

    const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
    const totalResponseTime =
      incidents.reduce((sum, i) => {
        if (i.acknowledgedAt && i.createdAt) {
          return sum + (i.acknowledgedAt - i.createdAt) / 1000;
        }
        return sum;
      }, 0) / incidents.length;

    const incidentsByType = {};
    incidents.forEach((i) => {
      incidentsByType[i.type] = (incidentsByType[i.type] || 0) + 1;
    });

    res.json({
      facility,
      stats: {
        totalIncidents: incidents.length,
        activeIncidents: activeIncidents.length,
        avgResponseTime: Math.round(totalResponseTime || 0),
        zones: zones.length,
        occupancyRate: Math.round((facility.currentOccupancy / facility.totalOccupancy) * 100),
        incidentsByType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get floor map data
router.get('/:facilityId/floors/:floorId/map', async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.floorId);
    const zones = await Zone.find({ floorId: req.params.floorId });
    const edges = await Edge.find({ floorId: req.params.floorId });
    const assets = await Asset.find({ zoneId: { $in: zones.map((z) => z._id) } });

    // Calculate zone risk scores
    await calculateZoneRiskScores(req.params.facilityId);
    const updatedZones = await Zone.find({ floorId: req.params.floorId });

    res.json({
      floor,
      zones: updatedZones,
      edges,
      assets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update facility occupancy
router.patch('/:id/occupancy', async (req, res) => {
  try {
    const { currentOccupancy } = req.body;
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { currentOccupancy },
      { new: true }
    );
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
