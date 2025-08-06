import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
import { registerRoutes } from '../server/routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Serve static files from the client build
app.use(express.static(path.join(__dirname, '../dist/public')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

export default app; 