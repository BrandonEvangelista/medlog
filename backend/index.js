const express = require('express')
const dotenv = require('dotenv')
const pool = require('./db')

dotenv.config()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'MedLog API is running' })
})

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ time: result.rows[0].now })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})