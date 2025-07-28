const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, removeAdditional: true });
addFormats(ajv);

// Load OpenAPI specification
let openApiSpec;
try {
  const openApiPath = path.join(__dirname, '../openapi/openapi.yaml');
  const openApiContent = fs.readFileSync(openApiPath, 'utf8');
  openApiSpec = yaml.load(openApiContent);
} catch (error) {
  console.error('Failed to load OpenAPI specification:', error.message);
  openApiSpec = { paths: {} };
}

/**
 * Resolve JSON pointer reference
 * @param {string} ref - JSON pointer reference (e.g., '#/components/schemas/Event')
 * @param {Object} spec - OpenAPI specification
 * @returns {Object|null} Resolved schema or null if not found
 */
function resolveRef(ref, spec) {
  if (!ref || !ref.startsWith('#/')) return null;
  
  const path = ref.substring(2).split('/'); // Remove '#/' and split
  let current = spec;
  
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Clean OpenAPI schema to make it compatible with AJV and resolve references
 * @param {Object} schema - OpenAPI schema
 * @param {Object} spec - Full OpenAPI specification for resolving references
 * @returns {Object} Cleaned JSON schema
 */
function cleanSchemaForAjv(schema, spec = openApiSpec) {
  if (!schema || typeof schema !== 'object') return schema;
  
  // Handle $ref
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) {
      return cleanSchemaForAjv(resolved, spec);
    }
    return schema; // Return as-is if reference can't be resolved
  }
  
  const cleaned = JSON.parse(JSON.stringify(schema));
  
  // Remove OpenAPI-specific keywords that AJV doesn't understand
  function removeOpenApiKeywords(obj) {
    if (Array.isArray(obj)) {
      return obj.map(removeOpenApiKeywords);
    } else if (obj && typeof obj === 'object') {
      // Handle $ref in nested objects
      if (obj.$ref) {
        const resolved = resolveRef(obj.$ref, spec);
        if (resolved) {
          return removeOpenApiKeywords(cleanSchemaForAjv(resolved, spec));
        }
        return obj;
      }
      
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip OpenAPI-specific keywords
        if (key === 'example' || key === 'examples' || key === 'description') {
          continue;
        }
        result[key] = removeOpenApiKeywords(value);
      }
      return result;
    }
    return obj;
  }
  
  return removeOpenApiKeywords(cleaned);
}

/**
 * Extract JSON schema from OpenAPI path specification
 * @param {Object} pathSpec - OpenAPI path specification
 * @param {string} method - HTTP method
 * @param {string} type - 'request' or 'response'
 * @returns {Object|null} JSON schema or null if not found
 */
function extractSchema(pathSpec, method, type) {
  const methodSpec = pathSpec[method.toLowerCase()];
  if (!methodSpec) return null;

  if (type === 'request') {
    // For request body validation
    const requestBody = methodSpec.requestBody;
    if (requestBody && requestBody.content && requestBody.content['application/json']) {
      const schema = requestBody.content['application/json'].schema;
      return cleanSchemaForAjv(schema);
    }
    return null;
  }

  if (type === 'response') {
    // For response validation (optional, mainly for development)
    const responses = methodSpec.responses;
    if (responses && responses['200'] && responses['200'].content && responses['200'].content['application/json']) {
      const schema = responses['200'].content['application/json'].schema;
      return cleanSchemaForAjv(schema);
    }
    return null;
  }

  return null;
}

/**
 * Create validation middleware for a specific route
 * @param {string} path - Route path
 * @param {string} method - HTTP method
 * @returns {Function} Express middleware function
 */
function createValidationMiddleware(path, method) {
  return (req, res, next) => {
    try {
      // Find matching path in OpenAPI spec
      const pathSpec = openApiSpec.paths[path];
      if (!pathSpec) {
        return next(); // No validation spec found, continue
      }

      // Extract request schema
      const requestSchema = extractSchema(pathSpec, method, 'request');
      if (!requestSchema) {
        return next(); // No request schema, continue
      }

      // Validate request body
      const validate = ajv.compile(requestSchema);
      const valid = validate(req.body);

      if (!valid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validate.errors.map(error => ({
            field: error.instancePath || error.schemaPath,
            message: error.message,
            rejectedValue: error.data
          }))
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      next(); // Continue on validation errors to avoid breaking the API
    }
  };
}

/**
 * Generic validation middleware that automatically detects route and method
 */
function validateRequest(req, res, next) {
  try {
    const path = req.route?.path || req.path;
    const method = req.method;

    // Find matching path in OpenAPI spec
    let pathSpec = openApiSpec.paths[path];
    
    // If exact path not found, try to match with parameter patterns
    if (!pathSpec) {
      for (const specPath in openApiSpec.paths) {
        // Convert OpenAPI path parameters to Express format for comparison
        const expressPath = specPath.replace(/{([^}]+)}/g, ':$1');
        if (expressPath === path) {
          pathSpec = openApiSpec.paths[specPath];
          break;
        }
      }
    }

    if (!pathSpec) {
      return next(); // No validation spec found, continue
    }

    // Extract request schema
    const requestSchema = extractSchema(pathSpec, method, 'request');
    if (!requestSchema) {
      return next(); // No request schema, continue
    }

    // Validate request body
    const validate = ajv.compile(requestSchema);
    const valid = validate(req.body);

    if (!valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validate.errors.map(error => ({
          field: error.instancePath || error.schemaPath,
          message: error.message,
          rejectedValue: error.data
        }))
      });
    }

    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    next(); // Continue on validation errors to avoid breaking the API
  }
}

/**
 * Middleware to validate response (mainly for development/testing)
 */
function validateResponse(req, res, next) {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  const originalSend = res.send;
  res.send = function(data) {
    try {
      const path = req.route?.path || req.path;
      const method = req.method;
      
      // Find matching path in OpenAPI spec
      let pathSpec = openApiSpec.paths[path];
      
      if (!pathSpec) {
        for (const specPath in openApiSpec.paths) {
          const expressPath = specPath.replace(/{([^}]+)}/g, ':$1');
          if (expressPath === path) {
            pathSpec = openApiSpec.paths[specPath];
            break;
          }
        }
      }

      if (pathSpec) {
        const responseSchema = extractSchema(pathSpec, method, 'response');
        if (responseSchema) {
          const validate = ajv.compile(responseSchema);
          const responseData = typeof data === 'string' ? JSON.parse(data) : data;
          const valid = validate(responseData);
          
          if (!valid) {
            console.warn(`Response validation failed for ${method} ${path}:`, validate.errors);
          }
        }
      }
    } catch (error) {
      console.error('Response validation error:', error);
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  validateRequest,
  validateResponse,
  createValidationMiddleware
};
