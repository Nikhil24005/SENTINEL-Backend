import User from '../models/User.js';
import Zone from '../models/Zone.js';
import Incident from '../models/Incident.js';
import Device from '../models/Device.js';

// Severity scoring based on incident type and context
export const calculateSeverity = async (incident) => {
  let baseScore = 0;

  // Base severity by type
  const severityMap = {
    fire: 95,
    smoke: 80,
    gas_leak: 85,
    medical: 70,
    panic_button: 60,
    crowd_surge: 75,
    suspicious_activity: 40,
  };

  baseScore = severityMap[incident.type] || 50;

  // Adjust by occupancy
  if (incident.zoneId) {
    const zone = await Zone.findById(incident.zoneId);
    if (zone && zone.occupancy > 100) {
      baseScore += 10;
    }
  }

  // Classify severity level
  let severity = 'low';
  if (baseScore > 80) severity = 'critical';
  else if (baseScore > 60) severity = 'high';
  else if (baseScore > 40) severity = 'medium';

  return { severity, riskScore: baseScore };
};

// Assign nearest available responders
export const assignResponders = async (incident, incidentId) => {
  const zone = await Zone.findById(incident.zoneId);
  if (!zone) return [];

  // Get available users by role
  const roleMap = {
    fire: ['firewarden', 'security'],
    smoke: ['firewarden', 'security'],
    gas_leak: ['firewarden', 'security'],
    medical: ['medic'],
    panic_button: ['security', 'admin'],
    crowd_surge: ['security', 'admin'],
    suspicious_activity: ['security', 'admin'],
  };

  const neededRoles = roleMap[incident.type] || [];
  const assignments = [];

  for (const role of neededRoles) {
    const responders = await User.find({ role, status: 'available' }).limit(2);

    for (const responder of responders) {
      // Calculate distance (simplified: using zone coordinates)
      const distance = Math.sqrt(
        Math.pow(zone.x - (responder.location?.x || 0), 2) +
          Math.pow(zone.y - (responder.location?.y || 0), 2)
      );

      const etaMinutes = Math.ceil(distance / 50); // Assume 50 units per minute

      assignments.push({
        userId: responder._id,
        roleNeeded: role,
        status: 'assigned',
        etaMinutes,
        distanceMeters: distance * 10, // Convert units to approximate meters
      });
    }
  }

  return assignments;
};

// Calculate zone risk scores
export const calculateZoneRiskScores = async (facilityId) => {
  const zones = await Zone.find({ facilityId });
  const activeIncidents = await Incident.find({
    facilityId,
    status: { $ne: 'resolved' },
  });

  for (const zone of zones) {
    let riskScore = 0;

    // Base on occupancy
    if (zone.occupancy > 80) riskScore += 20;
    else if (zone.occupancy > 50) riskScore += 10;

    // Check for nearby incidents
    const nearbyIncidents = activeIncidents.filter(
      (inc) => inc.zoneId.toString() === zone._id.toString()
    );

    if (nearbyIncidents.length > 0) {
      const maxSeverity = Math.max(
        ...nearbyIncidents.map((inc) => {
          const severityMap = {
            critical: 100,
            high: 80,
            medium: 50,
            low: 20,
          };
          return severityMap[inc.severity] || 0;
        })
      );
      riskScore += maxSeverity * 0.5;
    }

    // Check if blocked
    if (zone.blocked) riskScore += 30;

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    zone.riskScore = riskScore;
    await zone.save();
  }

  return zones;
};
