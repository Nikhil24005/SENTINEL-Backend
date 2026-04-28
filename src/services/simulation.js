import Incident from '../models/Incident.js';
import IncidentEvent from '../models/IncidentEvent.js';
import DrillRun from '../models/DrillRun.js';
import Assignment from '../models/Assignment.js';
import Zone from '../models/Zone.js';
import { calculateSeverity, assignResponders } from './decisionEngine.js';
import { sendNotification } from './notifications.js';
import { v4 as uuidv4 } from 'uuid';

export const simulateIncident = async (facilityId, zoneId, incidentType) => {
  try {
    const { severity, riskScore } = await calculateSeverity({ type: incidentType });

    const incident = new Incident({
      id: uuidv4(),
      facilityId,
      zoneId,
      type: incidentType,
      severity,
      status: 'new',
      source: 'simulation',
      riskScore,
      description: `Simulated ${incidentType} incident`,
    });

    const savedIncident = await incident.save();

    // Create initial event
    const event = new IncidentEvent({
      id: uuidv4(),
      incidentId: savedIncident._id,
      type: 'created',
      message: `${incidentType} detected in zone`,
      metadata: { source: 'simulation' },
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

    return savedIncident;
  } catch (error) {
    console.error('Simulation error:', error);
    throw error;
  }
};

export const createDrillRun = async (facilityId, scenario) => {
  const drillRun = new DrillRun({
    id: uuidv4(),
    facilityId,
    scenario,
    startedAt: new Date(),
    timeline: [],
    incidentIds: [],
  });

  await drillRun.save();
  return drillRun;
};

export const addDrillEvent = async (drillRunId, event) => {
  const drillRun = await DrillRun.findByIdAndUpdate(
    drillRunId,
    {
      $push: { timeline: { ...event, timestamp: new Date() } },
    },
    { new: true }
  );

  return drillRun;
};

export const completeDrillRun = async (drillRunId) => {
  const drillRun = await DrillRun.findById(drillRunId);

  if (!drillRun) return null;

  drillRun.endedAt = new Date();

  // Calculate score based on response times
  const incidents = await Incident.find({ _id: { $in: drillRun.incidentIds } });
  let totalScore = 100;

  for (const incident of incidents) {
    const createdAt = incident.createdAt;
    const acknowledgedAt = incident.acknowledgedAt;

    if (acknowledgedAt) {
      const responseTime = (acknowledgedAt - createdAt) / 1000 / 60; // minutes
      if (responseTime > 5) totalScore -= 20;
      else if (responseTime > 3) totalScore -= 10;
    } else {
      totalScore -= 30;
    }
  }

  drillRun.score = Math.max(0, totalScore);

  // Generate report
  drillRun.report = generateDrillReport(drillRun, incidents);

  await drillRun.save();
  return drillRun;
};

const generateDrillReport = (drillRun, incidents) => {
  return `DRILL REPORT: ${drillRun.scenario}
Started: ${drillRun.startedAt.toISOString()}
Ended: ${drillRun.endedAt?.toISOString() || 'In Progress'}
Score: ${drillRun.score}/100

Incidents Handled: ${incidents.length}
${incidents.map((i) => `- ${i.type} (${i.severity}): ${i.status}`).join('\n')}

Timeline Events: ${drillRun.timeline.length}
${drillRun.timeline
  .slice(-5)
  .map((e) => `- ${e.timestamp}: ${e.message}`)
  .join('\n')}

Recommendations:
- Continue drills weekly
- Review response protocols
- Improve team communication
`;
};

export const getDrillReport = async (drillRunId) => {
  return DrillRun.findById(drillRunId);
};
