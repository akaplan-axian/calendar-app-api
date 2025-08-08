# Testing Guide

This guide covers testing strategies, code coverage requirements, and best practices for the Calendar App API.

## Testing Framework

The project uses **Jest** as the primary testing framework with built-in code coverage powered by Istanbul/nyc.

### Test Configuration

- **Configuration File**: `jest.config.js`
- **Test Directory**: `tests/` (mirrors `src/` structure)
- **Coverage Reports**: `coverage/` directory
- **Test Environment**: Node.js

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with coverage in watch mode
npm run test:coverage:watch

# Run coverage and open HTML report
npm run test:coverage:open

# Check coverage thresholds
npm run coverage:check
```

### Test File Patterns

Jest automatically finds test files matching these patterns:
- `tests/**/*.test.js`
- `tests/**/*.spec.js`
- `**/__tests__/**/*.js`

## Code Coverage

### Coverage Configuration

Coverage settings are defined in `jest.config.js`:

```javascript
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/seeds/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/routes/': {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### Coverage Thresholds

#### Global Thresholds (Minimum)
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

#### Route-Specific Thresholds (Higher Standards)
- **Statements**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Branches**: 80%

### Coverage Reports

When you run `npm run test:coverage`, Jest generates multiple report formats:

1. **Console Output**: Immediate feedback with coverage percentages
2. **HTML Report**: Detailed interactive report at `coverage/lcov-report/index.html`
3. **LCOV Report**: For CI/CD integration (`coverage/lcov.info`)
4. **JSON Report**: Machine-readable format (`coverage/coverage-final.json`)

### Viewing Coverage Reports

**Option 1: Command Line**
```bash
npm run test:coverage
```

**Option 2: HTML Report (Recommended)**
```bash
npm run test:coverage:open
```
This runs coverage and automatically opens the HTML report in your browser.

**Option 3: Watch Mode**
```bash
npm run test:coverage:watch
```
Continuously runs tests with coverage as you make changes.

## Test Structure

### Test Organization

Tests are organized to mirror the `src/` directory structure:

```
tests/
├── setup.js                    # Test setup and configuration
├── test-express-app.js         # Test Express app instance
├── express.test.js             # Express app tests
├── config/
│   └── database.test.js        # Database configuration tests
├── handlers/
│   ├── events.test.js          # Event handler tests
│   ├── health.test.js          # Health handler tests
│   └── general.test.js         # General handler tests
├── models/
│   └── Event.test.js           # Event model tests
├── routes/
│   ├── events.test.js          # Event route tests
│   ├── health.test.js          # Health route tests
│   └── index.test.js           # Route index tests
└── utils/
    └── openapi.test.js         # OpenAPI utility tests
```

### Test File Template

```javascript
const request = require('supertest');
const app = require('../test-express-app');
const Event = require('../../src/models/Event');

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup before all tests
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  beforeEach(async () => {
    // Setup before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('Happy Path', () => {
    test('should work correctly', async () => {
      // Test implementation
      const response = await request(app)
        .get('/api/endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('expectedProperty');
    });
  });

  describe('Error Cases', () => {
    test('should handle errors gracefully', async () => {
      // Test error handling
      const response = await request(app)
        .get('/api/invalid-endpoint')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });
});
```

## Testing Strategies

### Unit Tests

Test individual functions and methods in isolation:

```javascript
// Testing a handler function
const { createEvent } = require('../../src/handlers/events');

describe('createEvent handler', () => {
  test('should create event with valid data', async () => {
    const mockReq = {
      body: {
        title: 'Test Event',
        startDate: '2025-08-01T10:00:00Z',
        endDate: '2025-08-01T11:00:00Z'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createEvent(null, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Event'
      })
    );
  });
});
```

### Integration Tests

Test complete request/response cycles:

```javascript
describe('POST /api/events', () => {
  test('should create new event', async () => {
    const eventData = {
      title: 'Integration Test Event',
      startDate: '2025-08-01T10:00:00Z',
      endDate: '2025-08-01T11:00:00Z'
    };

    const response = await request(app)
      .post('/api/events')
      .send(eventData)
      .expect(201);

    expect(response.body).toMatchObject({
      title: eventData.title,
      startDate: eventData.startDate,
      endDate: eventData.endDate
    });
    expect(response.body.id).toBeDefined();
  });
});
```

### Database Tests

Test model operations with test database:

```javascript
const Event = require('../../src/models/Event');

describe('Event Model', () => {
  beforeEach(async () => {
    // Clean database before each test
    await Event.query().delete();
  });

  test('should create event with valid data', async () => {
    const eventData = {
      title: 'Test Event',
      startDate: new Date('2025-08-01T10:00:00Z'),
      endDate: new Date('2025-08-01T11:00:00Z')
    };

    const event = await Event.query().insert(eventData);

    expect(event.title).toBe(eventData.title);
    expect(event.id).toBeDefined();
  });

  test('should validate required fields', async () => {
    const invalidData = {
      description: 'Missing required fields'
    };

    await expect(
      Event.query().insert(invalidData)
    ).rejects.toThrow();
  });
});
```

## Mocking

### Database Mocking

For unit tests, mock database operations:

```javascript
jest.mock('../../src/models/Event');
const Event = require('../../src/models/Event');

describe('Handler with mocked database', () => {
  test('should handle database operations', async () => {
    // Mock the query builder chain
    const mockQuery = {
      insert: jest.fn().mockResolvedValue({
        id: 'mock-id',
        title: 'Mock Event'
      })
    };
    Event.query.mockReturnValue(mockQuery);

    // Test your handler
    // ...

    expect(Event.query).toHaveBeenCalled();
    expect(mockQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String)
      })
    );
  });
});
```

### HTTP Request Mocking

For external API calls:

```javascript
const axios = require('axios');
jest.mock('axios');

describe('External API integration', () => {
  test('should handle external API calls', async () => {
    axios.get.mockResolvedValue({
      data: { result: 'success' }
    });

    // Test code that makes HTTP requests
    // ...

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('api.example.com')
    );
  });
});
```

## Test Data Management

### Test Fixtures

Create reusable test data:

```javascript
// tests/fixtures/events.js
const eventFixtures = {
  validEvent: {
    title: 'Test Event',
    description: 'Test Description',
    startDate: '2025-08-01T10:00:00Z',
    endDate: '2025-08-01T11:00:00Z',
    location: 'Test Location'
  },
  
  minimalEvent: {
    title: 'Minimal Event',
    startDate: '2025-08-01T10:00:00Z',
    endDate: '2025-08-01T11:00:00Z'
  },
  
  invalidEvent: {
    description: 'Missing required fields'
  }
};

module.exports = eventFixtures;
```

### Factory Functions

Create dynamic test data:

```javascript
const createEventData = (overrides = {}) => ({
  title: 'Default Event',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 3600000).toISOString(), // +1 hour
  ...overrides
});

// Usage
const eventData = createEventData({
  title: 'Custom Event Title'
});
```

## Testing Best Practices

### Test Naming

Use descriptive test names that explain the scenario:

```javascript
// Good
test('should return 404 when event does not exist', () => {});
test('should create event with valid data', () => {});
test('should validate required title field', () => {});

// Bad
test('event test', () => {});
test('should work', () => {});
test('test 1', () => {});
```

### Test Organization

Group related tests using `describe` blocks:

```javascript
describe('Event API', () => {
  describe('GET /api/events', () => {
    test('should return all events', () => {});
    test('should return empty array when no events', () => {});
  });

  describe('POST /api/events', () => {
    describe('with valid data', () => {
      test('should create event', () => {});
      test('should return created event', () => {});
    });

    describe('with invalid data', () => {
      test('should return validation error', () => {});
      test('should not create event', () => {});
    });
  });
});
```

### Assertion Best Practices

Use specific assertions:

```javascript
// Good
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('id');
expect(response.body.title).toBe('Expected Title');

// Better - use toMatchObject for partial matching
expect(response.body).toMatchObject({
  title: 'Expected Title',
  startDate: expect.any(String)
});

// Bad
expect(response).toBeTruthy();
expect(response.body).toBeDefined();
```

### Test Independence

Ensure tests don't depend on each other:

```javascript
describe('Independent tests', () => {
  beforeEach(async () => {
    // Clean state before each test
    await Event.query().delete();
  });

  test('test 1', async () => {
    // This test creates data
    await Event.query().insert(testData);
    // ... test logic
  });

  test('test 2', async () => {
    // This test starts with clean state
    // ... test logic
  });
});
```

## Coverage Improvement Strategies

### Identifying Uncovered Code

1. **Run coverage report**: `npm run test:coverage:open`
2. **Review HTML report**: Look for red/yellow highlighted lines
3. **Focus on critical paths**: Prioritize business logic coverage
4. **Check branch coverage**: Ensure all conditional paths are tested

### Common Coverage Gaps

1. **Error Handling**: Test error conditions and edge cases
2. **Validation Logic**: Test all validation scenarios
3. **Conditional Branches**: Test both true/false paths
4. **Async Operations**: Test promise resolution and rejection

### Example: Improving Branch Coverage

```javascript
// Function with conditional logic
const processEvent = (event) => {
  if (!event.title) {
    throw new Error('Title is required');
  }
  
  if (event.startDate > event.endDate) {
    throw new Error('Start date must be before end date');
  }
  
  return { ...event, processed: true };
};

// Tests covering all branches
describe('processEvent', () => {
  test('should process valid event', () => {
    const event = {
      title: 'Test',
      startDate: '2025-08-01T10:00:00Z',
      endDate: '2025-08-01T11:00:00Z'
    };
    
    const result = processEvent(event);
    expect(result.processed).toBe(true);
  });

  test('should throw error for missing title', () => {
    const event = {
      startDate: '2025-08-01T10:00:00Z',
      endDate: '2025-08-01T11:00:00Z'
    };
    
    expect(() => processEvent(event)).toThrow('Title is required');
  });

  test('should throw error for invalid date range', () => {
    const event = {
      title: 'Test',
      startDate: '2025-08-01T11:00:00Z',
      endDate: '2025-08-01T10:00:00Z'
    };
    
    expect(() => processEvent(event)).toThrow('Start date must be before end date');
  });
});
```

## Continuous Integration

### Coverage in CI/CD

The `coverage/lcov.info` file can be used with coverage services:

```yaml
# GitHub Actions example
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Coverage Badges

Add coverage badges to README:

```markdown
[![Coverage Status](https://coveralls.io/repos/github/username/repo/badge.svg?branch=main)](https://coveralls.io/github/username/repo?branch=main)
```

## Troubleshooting Tests

### Common Issues

**Tests timing out:**
```javascript
// Increase timeout for slow tests
test('slow operation', async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

**Database connection issues:**
```javascript
// Ensure proper cleanup
afterAll(async () => {
  await knex.destroy();
});
```

**Mock not working:**
```javascript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Debugging Tests

```javascript
// Add debug output
test('debug test', () => {
  console.log('Debug info:', testData);
  // Test implementation
});

// Use debugger
test('debug with breakpoint', () => {
  debugger; // Will pause execution
  // Test implementation
});
```

## Related Documentation

- [Development Guide](development.md) - Development workflow and best practices
- [Code Coverage Standards](code-coverage-standards.md) - Detailed coverage requirements
- [Installation Guide](installation.md) - Setting up the test environment
- [API Documentation](api.md) - Understanding the API for integration tests
