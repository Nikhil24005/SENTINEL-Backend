import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Facility from '../models/Facility.js';
import Floor from '../models/Floor.js';
import Zone from '../models/Zone.js';
import Asset from '../models/Asset.js';
import Device from '../models/Device.js';
import Edge from '../models/Edge.js';
import SOPTemplate from '../models/SOPTemplate.js';
import Incident from '../models/Incident.js';
import IncidentEvent from '../models/IncidentEvent.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel';

mongoose.connect(MONGO_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Facility.deleteMany({});
    await Floor.deleteMany({});
    await Zone.deleteMany({});
    await Asset.deleteMany({});
    await Device.deleteMany({});
    await Edge.deleteMany({});
    await SOPTemplate.deleteMany({});
    await Incident.deleteMany({});
    await IncidentEvent.deleteMany({});

    console.log('Database cleared');

    // Create demo users
    const demoUsers = [
      {
        id: uuidv4(),
        name: 'Admin Control',
        email: 'admin@sentinel.demo',
        role: 'admin',
        phone: '+1-555-0100',
        status: 'available',
        location: { x: 100, y: 100 },
      },
      {
        id: uuidv4(),
        name: 'Security Chief',
        email: 'security@sentinel.demo',
        role: 'security',
        phone: '+1-555-0101',
        status: 'available',
        location: { x: 200, y: 150 },
      },
      {
        id: uuidv4(),
        name: 'Dr. Sarah Medical',
        email: 'medic@sentinel.demo',
        role: 'medic',
        phone: '+1-555-0102',
        status: 'available',
        location: { x: 150, y: 200 },
      },
      {
        id: uuidv4(),
        name: 'Fire Chief',
        email: 'firewarden@sentinel.demo',
        role: 'firewarden',
        phone: '+1-555-0103',
        status: 'available',
        location: { x: 250, y: 100 },
      },
    ];

    const users = await User.insertMany(demoUsers);
    console.log(`Created ${users.length} demo users`);

    // Create SOPTemplates
    const sopTemplates = [
      {
        id: uuidv4(),
        incidentType: 'fire',
        title: 'Fire Response Protocol',
        steps: [
          'Activate fire alarm',
          'Evacuate the area',
          'Contact emergency services',
          'Account for all personnel',
        ],
        announcementText:
          'Attention: This facility is experiencing a fire emergency. Please evacuate immediately using the nearest exit. Do not use elevators.',
      },
      {
        id: uuidv4(),
        incidentType: 'medical',
        title: 'Medical Emergency Protocol',
        steps: [
          'Assess patient condition',
          'Locate nearest AED',
          'Call EMS',
          'Begin CPR if needed',
          'Document incident',
        ],
        announcementText: 'Is there a medical professional in this area? Medical emergency in progress.',
      },
      {
        id: uuidv4(),
        incidentType: 'panic_button',
        title: 'Security Alert Protocol',
        steps: ['Dispatch security', 'Establish perimeter', 'Contact authorities', 'Document incident'],
        announcementText: 'Security alert: Trained personnel responding. Please remain calm.',
      },
      {
        id: uuidv4(),
        incidentType: 'crowd_surge',
        title: 'Crowd Management Protocol',
        steps: [
          'Direct crowd flow',
          'Open alternative exits',
          'Contact security backup',
          'Monitor for injuries',
        ],
        announcementText:
          'Attention: Please proceed calmly and use all available exits. Follow staff directions.',
      },
    ];

    await SOPTemplate.insertMany(sopTemplates);
    console.log('Created SOP templates');

    // Create 3 Facilities
    const hotelFacility = new Facility({
      id: uuidv4(),
      name: 'Grand Plaza Hotel',
      type: 'hotel',
      address: '123 Main Street',
      totalOccupancy: 500,
      currentOccupancy: 380,
    });

    const mallFacility = new Facility({
      id: uuidv4(),
      name: 'Central Shopping Mall',
      type: 'mall',
      address: '456 Commerce Avenue',
      totalOccupancy: 2000,
      currentOccupancy: 1450,
    });

    const stadiumFacility = new Facility({
      id: uuidv4(),
      name: 'Stadium Arena',
      type: 'stadium',
      address: '789 Sports Boulevard',
      totalOccupancy: 50000,
      currentOccupancy: 32000,
    });

    const facilities = await Facility.insertMany([hotelFacility, mallFacility, stadiumFacility]);
    console.log('Created 3 facilities');

    // Create Floors and Zones for Hotel
    const hotelFloor = new Floor({
      id: uuidv4(),
      facilityId: facilities[0]._id,
      name: 'Main Floor',
      level: 1,
      occupancy: 150,
      totalOccupancy: 200,
    });
    await hotelFloor.save();

    const hotelZones = [
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        facilityId: facilities[0]._id,
        name: 'Lobby',
        type: 'room',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        occupancy: 50,
        blocked: false,
        riskScore: 20,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        facilityId: facilities[0]._id,
        name: 'Restaurant',
        type: 'room',
        x: 350,
        y: 150,
        width: 250,
        height: 200,
        occupancy: 80,
        blocked: false,
        riskScore: 15,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        facilityId: facilities[0]._id,
        name: 'Corridor A',
        type: 'corridor',
        x: 200,
        y: 350,
        width: 100,
        height: 200,
        occupancy: 20,
        blocked: false,
        riskScore: 10,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        facilityId: facilities[0]._id,
        name: 'Main Exit',
        type: 'exit',
        x: 50,
        y: 50,
        width: 80,
        height: 60,
        occupancy: 0,
        blocked: false,
        riskScore: 0,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        facilityId: facilities[0]._id,
        name: 'Assembly Point',
        type: 'assembly_point',
        x: 600,
        y: 600,
        width: 150,
        height: 150,
        occupancy: 0,
        blocked: false,
        riskScore: 0,
      },
    ];

    const savedHotelZones = await Zone.insertMany(hotelZones);
    console.log('Created hotel zones');

    // Create Assets and Devices for Hotel
    const hotelAssets = [
      {
        id: uuidv4(),
        zoneId: savedHotelZones[0]._id,
        type: 'AED',
        status: 'operational',
        x: 120,
        y: 110,
      },
      {
        id: uuidv4(),
        zoneId: savedHotelZones[1]._id,
        type: 'extinguisher',
        status: 'operational',
        x: 360,
        y: 160,
      },
    ];

    const hotelDevices = [
      {
        id: uuidv4(),
        zoneId: savedHotelZones[0]._id,
        type: 'smoke_sensor',
        status: 'active',
        lastReading: { smoke: false },
      },
      {
        id: uuidv4(),
        zoneId: savedHotelZones[1]._id,
        type: 'panic_button',
        status: 'active',
        lastReading: null,
      },
    ];

    await Asset.insertMany(hotelAssets);
    await Device.insertMany(hotelDevices);
    console.log('Created hotel assets and devices');

    // Create Edges for Hotel (connectivity)
    const hotelEdges = [
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        fromZoneId: savedHotelZones[0]._id, // Lobby
        toZoneId: savedHotelZones[1]._id, // Restaurant
        distance: 50,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        fromZoneId: savedHotelZones[1]._id, // Restaurant
        toZoneId: savedHotelZones[2]._id, // Corridor
        distance: 40,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        fromZoneId: savedHotelZones[0]._id, // Lobby
        toZoneId: savedHotelZones[3]._id, // Exit
        distance: 100,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: hotelFloor._id,
        fromZoneId: savedHotelZones[1]._id, // Restaurant
        toZoneId: savedHotelZones[3]._id, // Exit
        distance: 150,
        accessible: true,
      },
    ];

    await Edge.insertMany(hotelEdges);
    console.log('Created hotel edges');

    // Create Floors and Zones for Mall
    const mallFloor = new Floor({
      id: uuidv4(),
      facilityId: facilities[1]._id,
      name: 'Ground Level',
      level: 0,
      occupancy: 600,
      totalOccupancy: 800,
    });
    await mallFloor.save();

    const mallZones = [
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        facilityId: facilities[1]._id,
        name: 'Food Court',
        type: 'room',
        x: 150,
        y: 200,
        width: 300,
        height: 250,
        occupancy: 150,
        blocked: false,
        riskScore: 25,
      },
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        facilityId: facilities[1]._id,
        name: 'Entrance',
        type: 'room',
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        occupancy: 100,
        blocked: false,
        riskScore: 20,
      },
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        facilityId: facilities[1]._id,
        name: 'Main Corridor',
        type: 'corridor',
        x: 300,
        y: 300,
        width: 200,
        height: 50,
        occupancy: 200,
        blocked: false,
        riskScore: 30,
      },
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        facilityId: facilities[1]._id,
        name: 'Exit 1',
        type: 'exit',
        x: 20,
        y: 200,
        width: 80,
        height: 60,
        occupancy: 0,
        blocked: false,
        riskScore: 0,
      },
    ];

    const savedMallZones = await Zone.insertMany(mallZones);
    console.log('Created mall zones');

    // Create Assets and Devices for Mall
    const mallAssets = [
      {
        id: uuidv4(),
        zoneId: savedMallZones[0]._id,
        type: 'AED',
        status: 'operational',
        x: 180,
        y: 220,
      },
      {
        id: uuidv4(),
        zoneId: savedMallZones[2]._id,
        type: 'extinguisher',
        status: 'operational',
        x: 320,
        y: 310,
      },
    ];

    const mallDevices = [
      {
        id: uuidv4(),
        zoneId: savedMallZones[0]._id,
        type: 'crowd_sensor',
        status: 'active',
        lastReading: { crowd_density: 0.7 },
      },
      {
        id: uuidv4(),
        zoneId: savedMallZones[1]._id,
        type: 'panic_button',
        status: 'active',
      },
    ];

    await Asset.insertMany(mallAssets);
    await Device.insertMany(mallDevices);

    // Create Edges for Mall
    const mallEdges = [
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        fromZoneId: savedMallZones[0]._id,
        toZoneId: savedMallZones[2]._id,
        distance: 80,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        fromZoneId: savedMallZones[1]._id,
        toZoneId: savedMallZones[2]._id,
        distance: 120,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: mallFloor._id,
        fromZoneId: savedMallZones[2]._id,
        toZoneId: savedMallZones[3]._id,
        distance: 100,
        accessible: true,
      },
    ];

    await Edge.insertMany(mallEdges);
    console.log('Created mall edges');

    // Create Floors and Zones for Stadium
    const stadiumFloor = new Floor({
      id: uuidv4(),
      facilityId: facilities[2]._id,
      name: 'Main Venue',
      level: 0,
      occupancy: 32000,
      totalOccupancy: 50000,
    });
    await stadiumFloor.save();

    const stadiumZones = [
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        facilityId: facilities[2]._id,
        name: 'South Gate',
        type: 'room',
        x: 100,
        y: 100,
        width: 150,
        height: 120,
        occupancy: 5000,
        blocked: false,
        riskScore: 35,
      },
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        facilityId: facilities[2]._id,
        name: 'North Gate',
        type: 'room',
        x: 500,
        y: 100,
        width: 150,
        height: 120,
        occupancy: 4000,
        blocked: false,
        riskScore: 30,
      },
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        facilityId: facilities[2]._id,
        name: 'Main Field',
        type: 'room',
        x: 300,
        y: 300,
        width: 400,
        height: 300,
        occupancy: 20000,
        blocked: false,
        riskScore: 40,
      },
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        facilityId: facilities[2]._id,
        name: 'Emergency Exit',
        type: 'exit',
        x: 50,
        y: 300,
        width: 100,
        height: 80,
        occupancy: 0,
        blocked: false,
        riskScore: 0,
      },
    ];

    const savedStadiumZones = await Zone.insertMany(stadiumZones);
    console.log('Created stadium zones');

    // Create Assets and Devices for Stadium
    const stadiumAssets = [
      {
        id: uuidv4(),
        zoneId: savedStadiumZones[0]._id,
        type: 'AED',
        status: 'operational',
        x: 120,
        y: 110,
      },
      {
        id: uuidv4(),
        zoneId: savedStadiumZones[2]._id,
        type: 'AED',
        status: 'operational',
        x: 350,
        y: 350,
      },
    ];

    const stadiumDevices = [
      {
        id: uuidv4(),
        zoneId: savedStadiumZones[0]._id,
        type: 'crowd_sensor',
        status: 'active',
        lastReading: { crowd_density: 0.9 },
      },
      {
        id: uuidv4(),
        zoneId: savedStadiumZones[2]._id,
        type: 'smoke_sensor',
        status: 'active',
        lastReading: { smoke: false },
      },
    ];

    await Asset.insertMany(stadiumAssets);
    await Device.insertMany(stadiumDevices);

    // Create Edges for Stadium
    const stadiumEdges = [
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        fromZoneId: savedStadiumZones[0]._id,
        toZoneId: savedStadiumZones[2]._id,
        distance: 150,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        fromZoneId: savedStadiumZones[1]._id,
        toZoneId: savedStadiumZones[2]._id,
        distance: 180,
        accessible: true,
      },
      {
        id: uuidv4(),
        floorId: stadiumFloor._id,
        fromZoneId: savedStadiumZones[2]._id,
        toZoneId: savedStadiumZones[3]._id,
        distance: 200,
        accessible: true,
      },
    ];

    await Edge.insertMany(stadiumEdges);
    console.log('Created stadium edges');

    // Create sample historical incidents
    const sampleIncident = new Incident({
      id: uuidv4(),
      facilityId: facilities[0]._id,
      floorId: hotelFloor._id,
      zoneId: savedHotelZones[0]._id,
      type: 'medical',
      severity: 'high',
      status: 'resolved',
      source: 'sensor',
      riskScore: 70,
      description: 'Guest reported chest pain',
      createdAt: new Date(Date.now() - 3600000),
      acknowledgedAt: new Date(Date.now() - 3590000),
      resolvedAt: new Date(Date.now() - 3500000),
    });
    await sampleIncident.save();

    const sampleEvent = new IncidentEvent({
      id: uuidv4(),
      incidentId: sampleIncident._id,
      type: 'created',
      message: 'Medical emergency reported in lobby',
      metadata: { source: 'manual' },
    });
    await sampleEvent.save();

    console.log('Created sample incident');

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
