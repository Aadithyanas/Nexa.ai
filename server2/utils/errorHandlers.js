/**
 * Set up global error handlers for uncaught exceptions
 */
function handleUncaughtExceptions() {
  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error)
  })

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
  })
}

module.exports = {
  handleUncaughtExceptions,
}
