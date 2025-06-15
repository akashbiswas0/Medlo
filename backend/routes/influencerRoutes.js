// routes/influencerRoutes.js
import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// POST route to create a new influencer
router.post('/post', async (req, res) => {
  try {
    const { username, x_username, insta_username, follower_count } = req.body;

    // Validate required fields
    if (!username || !x_username || !insta_username || !follower_count) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Please provide username, x_username, insta_username, and follower_count'
      });
    }

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('influencer')
      .insert([
        {
          username,
          x_username,
          insta_username,
          follower_count
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    return res.status(201).json({
      message: 'Influencer created successfully',
      data
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

// GET route to fetch all influencers
router.get('/get', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('influencer')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

export default router;
