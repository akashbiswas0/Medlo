// routes/influencerRoutes.js
const express = require('express')
const supabase = require('../db/supabase')

const router = express.Router()

// POST route
router.post('/post', async (req, res) => {
  const { username, x_username, insta_username, follower_count } = req.body

  const { data, error } = await supabase.from('influencer').insert([
    { username, x_username, insta_username, follower_count },
  ])

  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json({ message: 'Influencer added successfully', data })
})

// GET route
router.get('/get', async (req, res) => {
  const { data, error } = await supabase.from('influencer').select('*')

  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json({ influencers: data })
})

module.exports = router
