import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.js';
import historyRoutes from './routes/history.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

import { requireAuth } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'AI Test Case Generator API',
    version: '1.0.0',
    endpoints: {
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      health: 'GET /api/health',
      generate: 'POST /api/generate',
      history: 'GET /api/history',
      historyItem: 'GET /api/history/:id',
      deleteHistory: 'DELETE /api/history/:id',
    },
  });
});

// Public auth routes — no JWT required
app.use('/api/auth', authRoutes);

// Apply JWT middleware to all routes below this line
app.use('/api', requireAuth);

// Protected routes
app.use('/api', generateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AI Test Case Generator API running on http://localhost:${PORT}`);
  console.log(`Ollama model: ${process.env.OLLAMA_MODEL || 'llama3'}`);
});
