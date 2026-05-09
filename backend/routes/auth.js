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

module.exports = router