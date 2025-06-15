import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// POST route to create a new brand
router.post('/post', async (req, res) => {
  try {
    console.log('Received brand data:', req.body);
    const { brand_name, brand_niche, brand_x_username, brand_email } = req.body;

    // Validate required fields
    if (!brand_name || !brand_niche || !brand_x_username || !brand_email) {
      console.log('Missing fields:', {
        brand_name: !brand_name,
        brand_niche: !brand_niche,
        brand_x_username: !brand_x_username,
        brand_email: !brand_email
      });
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Please provide brand_name, brand_niche, brand_x_username, and brand_email'
      });
    }

    console.log('Attempting to insert into Supabase...');
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('brand')
      .insert([
        {
          brand_name,
          brand_niche,
          brand_x_username,
          brand_email
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    console.log('Successfully inserted brand:', data);
    return res.status(201).json({
      message: 'Brand created successfully',
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

// GET route to fetch all brands
router.get('/get', async (req, res) => {
  try {
    console.log('Fetching all brands...');
    const { data, error } = await supabase
      .from('brand')
      .select('*');

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    console.log('Successfully fetched brands:', data);
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