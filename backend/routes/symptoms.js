const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')

router.post('/', authenticateToken, async (req, res) => {
  const { heart_rate, fatigue_level, pain_level, notes } = req.body
  const user_id = req.user.id

  try {
    const result = await pool.query(
      'INSERT INTO symptoms (user_id, heart_rate, fatigue_level, pain_level, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, heart_rate, fatigue_level, pain_level, notes]
    )

    res.status(201).json({ symptom: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log symptom' })
  }
})

router.get('/', authenticateToken, async (req, res) => {
  const user_id = req.user.id

  try {
    const result = await pool.query(
      'SELECT * FROM symptoms WHERE user_id = $1 ORDER BY logged_at DESC',
      [user_id]
    )

    res.json({ symptoms: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch symptoms' })
  }
})
router.get('/:patientId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'clinician') {
    return res.status(403).json({ error: 'Access denied. Clinicians only.' })
  }

  const { patientId } = req.params

  try {
    const result = await pool.query(
      'SELECT * FROM symptoms WHERE user_id = $1 ORDER BY logged_at DESC',
      [patientId]
    )

    await pool.query(
      'INSERT INTO audit_logs (accessed_by, patient_id, action) VALUES ($1, $2, $3)',
      [req.user.id, patientId, 'viewed patient symptoms']
    )

    res.json({ symptoms: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch patient symptoms' })
  }
})
module.exports = router