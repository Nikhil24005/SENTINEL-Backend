import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';

// Import routes
import incidentsRouter from './routes/incidents.js';
import facilitiesRouter from './routes/facilities.js';
import usersRouter from './routes/users.js';
import simulationRouter from './routes/simulation.js';
import routingRouter from './routes/routing.js';
import helpRouter from './routes/help.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Debug: report which Mongo env vars are present (do not log full credentials)
console.log('env MONGO_URI present:', !!process.env.MONGO_URI, 'env MONGODB_URI present:', !!process.env.MONGODB_URI);

// Connect to database
await connectDB();

// API Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/users', usersRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/routing', routingRouter);
app.use('/api/help', helpRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Favicon requests from the browser should not hit the API as an error.
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SENTINEL Backend running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
