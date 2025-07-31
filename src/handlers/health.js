// Handler for getHealthStatus operation
async function getHealthStatus(c, req, res) {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Health check failed'
    });
  }
}

module.exports = {
  getHealthStatus
};
