
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import itemsRouter from './routes/items.js';

// Import middleware
import apiKeyMiddleware from './middleware/auth.js';

// Initialize environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply API key authentication middleware globally
app.use(apiKeyMiddleware);

// Routes
app.use('/api/items', itemsRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Express Prisma API with API key authentication',
    endpoints: {
      items: '/api/items'
    },
    authentication: 'API key required for POST, PUT, DELETE operations'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle Prisma disconnection on app termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
