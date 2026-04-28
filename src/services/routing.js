import Zone from '../models/Zone.js';
import Edge from '../models/Edge.js';
import Asset from '../models/Asset.js';

// Dijkstra's algorithm for shortest path
const dijkstra = (graph, start, end) => {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }
  distances[start] = 0;

  while (unvisited.size > 0) {
    let current = null;
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) {
        current = node;
      }
    }

    if (current === null || distances[current] === Infinity) break;

    unvisited.delete(current);

    if (current === end) break;

    for (const neighbor of graph[current] || []) {
      const alt = distances[current] + neighbor.distance;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[end],
  };
};

// Generate safe evacuation route
export const generateEvacuationRoute = async (fromZoneId, floorId) => {
  try {
    const zones = await Zone.find({ floorId });
    const edges = await Edge.find({ floorId });

    // Build graph
    const graph = {};
    for (const zone of zones) {
      graph[zone._id.toString()] = [];
    }

    // Add accessible edges
    for (const edge of edges) {
      if (edge.accessible) {
        const fromId = edge.fromZoneId.toString();
        const toId = edge.toZoneId.toString();

        if (!graph[fromId]) graph[fromId] = [];
        graph[fromId].push({
          to: toId,
          distance: edge.distance,
        });
      }
    }

    // Find nearest exit
    const exits = zones.filter((z) => z.type === 'exit');
    if (exits.length === 0) return null;

    const startZone = zones.find((z) => z._id.toString() === fromZoneId.toString());
    if (!startZone) return null;

    // Find shortest path to any exit
    let shortestPath = null;
    let shortestDistance = Infinity;

    for (const exit of exits) {
      const result = dijkstra(graph, fromZoneId.toString(), exit._id.toString());
      if (result.distance < shortestDistance && result.path.length > 0) {
        shortestDistance = result.distance;
        shortestPath = result;
      }
    }

    if (!shortestPath) return null;

    // Convert zone IDs back to zone objects
    const routeZones = await Promise.all(
      shortestPath.path.map((zoneId) => Zone.findById(zoneId))
    );

    return {
      path: routeZones.filter(Boolean),
      distance: shortestPath.distance,
      estimatedTimeSeconds: shortestPath.distance * 1.5, // Rough estimate
    };
  } catch (error) {
    console.error('Route generation error:', error);
    return null;
  }
};

// Generate responder route to incident
export const generateResponderRoute = async (fromZoneId, toZoneId, floorId) => {
  try {
    const route = await generateEvacuationRoute(fromZoneId, floorId);
    if (!route) return null;

    return {
      ...route,
      destination: await Zone.findById(toZoneId),
    };
  } catch (error) {
    console.error('Responder route generation error:', error);
    return null;
  }
};

// Find nearest AED to zone
export const findNearestAED = async (zoneId, floorId) => {
  try {
    const zone = await Zone.findById(zoneId);
    const assets = await Asset.find({
      type: 'AED',
      $expr: {
        $lte: [
          {
            $sqrt: [
              {
                $add: [
                  { $pow: [{ $subtract: ['$x', zone.x] }, 2] },
                  { $pow: [{ $subtract: ['$y', zone.y] }, 2] },
                ],
              },
            ],
          },
          500, // Within 500 units
        ],
      },
    });

    return assets.length > 0 ? assets[0] : null;
  } catch (error) {
    console.error('AED search error:', error);
    return null;
  }
};
