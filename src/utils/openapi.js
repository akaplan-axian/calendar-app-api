const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

let cachedSpec = null;

/**
 * Load and cache the OpenAPI specification
 * @returns {Object} The parsed OpenAPI specification
 */
function loadOpenAPISpec() {
  if (!cachedSpec) {
    const openApiPath = path.join(__dirname, '../openapi/openapi.yaml');
    cachedSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));
  }
  return cachedSpec;
}

/**
 * Get a schema from the OpenAPI components
 * @param {string} schemaName - The name of the schema to retrieve
 * @returns {Object} The JSON schema object
 */
function getOpenAPISchema(schemaName) {
  const spec = loadOpenAPISpec();
  return spec.components?.schemas?.[schemaName];
}

/**
 * Clear the cached OpenAPI spec (useful for testing)
 */
function clearCache() {
  cachedSpec = null;
}

module.exports = {
  loadOpenAPISpec,
  getOpenAPISchema,
  clearCache
};
