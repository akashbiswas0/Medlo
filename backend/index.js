import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import influencerRoutes from './routes/influencerRoutes.js';
import brandRoutes from './routes/brandRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/influencer', influencerRoutes);
app.use('/api/brand', brandRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 