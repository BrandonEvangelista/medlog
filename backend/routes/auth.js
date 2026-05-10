const express = require('express')
const router = express.Router()
const pool = require('../db')
const bcrypt = require('bcrypt')

router.post('/register', async (req, res) => {
    const {email, password,role } = req.body

    try {
        const saltRounds = 10
        const password_hash = await bcrypt.hash(password, saltRounds)

        const result = await pool.query (
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',[email, password_hash, role]
    
        )

        res.status(201).json({user: result.rows[0]})
    }catch (err) {
        console.error(err)
        res.status(500).json({error: 'Registration failed'})
    }
})
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})
module.exports = router