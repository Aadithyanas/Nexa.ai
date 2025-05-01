const express = require("express")
const cors = require("cors")
const routes = require("./routes")
const { handleUncaughtExceptions } = require("./utils/errorHandlers")
require("dotenv").config()

// Set up Express app
const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api", routes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`- Health check available at http://localhost:${PORT}/health`)
})

// Handle uncaught exceptions
handleUncaughtExceptions()
