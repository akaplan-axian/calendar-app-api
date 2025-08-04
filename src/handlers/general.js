const { loadOpenAPISpec } = require('../utils/openapi');

// Handler for getApiInfo operation
async function getApiInfo(c, req, res) {
  try {
    res.status(200).json({
      message: 'Calendar App API',
      version: '1.0.0',
      status: 'running'
    });
  } catch (error) {
    console.error('Error in API info:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get API info'
    });
  }
}

// Handler for getOpenAPISchema operation
async function getOpenAPISchema(c, req, res) {
  try {
    const openApiSpec = loadOpenAPISpec();
    res.status(200).json(openApiSpec);
  } catch (error) {
    console.error('Error loading OpenAPI schema:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load OpenAPI schema'
    });
  }
}

module.exports = {
  getApiInfo,
  getOpenAPISchema
};
