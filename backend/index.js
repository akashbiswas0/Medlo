import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import influencerRoutes from './routes/influencerRoutes.mjs';
import brandRoutes from './routes/brandRoutes.mjs';
import modelRoutes from './routes/modelRoutes.mjs';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

// Routes
console.log('Registering routes...');
app.use('/api/influencer', influencerRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/model', modelRoutes);
console.log('Routes registered successfully');

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    details: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available routes:');
  console.log('- POST /api/model/post');
  console.log('- GET /api/model/get');
  console.log('- POST /api/brand/post');
  console.log('- GET /api/brand/get');
  console.log('- POST /api/influencer/post');
  console.log('- GET /api/influencer/get');
}); 