import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Model routes are working' });
});

// POST route to store model details
router.post('/post', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { trigger, model_id } = req.body;
    console.log('Parsed data:', { trigger, model_id });

    if (!trigger || !model_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Please provide trigger and model_id'
      });
    }

    const { data, error } = await supabase
      .from('model_details')
      .insert([{ trigger, model_id }])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    return res.status(201).json({
      message: 'Model details saved successfully',
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

// GET route to fetch all model details
router.get('/get', async (req, res) => {
  try {
    console.log('Fetching all model details...');
    const { data, error } = await supabase
      .from('model_details')
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

    console.log('Successfully fetched model details:', data);
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