const express = require("express")
const fileRoutes = require("./fileRoutes")

const router = express.Router()

// Register all route modules
router.use("/files", fileRoutes)

module.exports = router
