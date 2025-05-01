const express = require("express")
const { upload } = require("../middleware/fileUpload")
const { processFile } = require("../controllers/fileController")

const router = express.Router()

// File upload endpoint
router.post("/upload", upload.single("file"), processFile)

module.exports = router
