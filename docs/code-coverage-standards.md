# Code Coverage Standards

## Critical Instructions for Future LLMs

This file serves as a memory bank to ensure code coverage standards are maintained and improved throughout the project lifecycle.

### 🚨 MANDATORY REQUIREMENTS

**BEFORE CONSIDERING ANY TASK COMPLETE:**
1. **ALWAYS run `npm test` and ensure ALL tests pass**
2. **If ANY tests fail, fix them IMMEDIATELY before proceeding**
3. **Never mark a task as complete with failing tests**
4. **Test failures must be resolved, not ignored or bypassed**

**ALWAYS** run code coverage and ensure thresholds are met when making ANY of the following changes:

1. **Adding new code files** (handlers, models, utilities, middleware)
2. **Modifying existing functions or methods**
3. **Adding new API endpoints or routes**
4. **Refactoring existing code**
5. **Before completing any development task**
6. **Before submitting pull requests**

### 📊 Current Coverage Configuration

**Coverage Tool**: Jest with built-in Istanbul/nyc
**Configuration File**: `jest.config.js`

**Current Thresholds:**
- **Global Minimum**: 70% for statements, branches, functions, and lines
- **Routes Directory**: 80% branches, 90% functions/lines/statements
- **Excluded Files**: migrations, seeds, test files

**Coverage Commands:**
```bash
npm run test:coverage              # Generate coverage reports
npm run test:coverage:open         # Generate and open HTML report
npm run test:coverage:watch        # Continuous coverage monitoring
npm run coverage:check             # Validate coverage thresholds
```

### 🎯 Coverage Standards by File Type

#### Routes (`src/routes/*.js`)
- **Target**: 90% statements, functions, lines; 80% branches
- **Priority**: HIGH - These are critical API endpoints
- **Test Requirements**: 
  - Test all HTTP methods
  - Test success and error cases
  - Test input validation
  - Test edge cases

#### Handlers (`src/handlers/*.js`)
- **Target**: 85% statements, functions, lines; 75% branches
- **Priority**: HIGH - Core business logic
- **Test Requirements**:
  - Unit tests for each handler function
  - Mock external dependencies
  - Test error handling
  - Test data transformation

#### Models (`src/models/*.js`)
- **Target**: 80% statements, functions, lines; 70% branches
- **Priority**: MEDIUM-HIGH - Data layer integrity
- **Test Requirements**:
  - Test model validation
  - Test database operations (with mocks)
  - Test relationships
  - Test custom methods

#### Middleware (`src/middleware/*.js`)
- **Target**: 75% statements, functions, lines; 65% branches
- **Priority**: MEDIUM - Request/response processing
- **Test Requirements**:
  - Test middleware functionality
  - Test error conditions
  - Test request/response modifications

#### Utilities (`src/utils/*.js`)
- **Target**: 80% statements, functions, lines; 70% branches
- **Priority**: MEDIUM - Helper functions
- **Test Requirements**:
  - Unit tests for all utility functions
  - Test edge cases and error conditions
  - Test input validation

### 🔄 Coverage Workflow for Future LLMs

#### When Adding New Code:

1. **Write the code**
2. **Immediately write tests** covering:
   - Happy path scenarios
   - Error conditions
   - Edge cases
   - Input validation
3. **Run coverage**: `npm run test:coverage`
4. **Check coverage report** for the new code
5. **Add more tests** if coverage is below thresholds
6. **Verify overall project coverage** hasn't decreased

#### When Modifying Existing Code:

1. **Run existing tests**: `npm test`
2. **Make code changes**
3. **Update existing tests** if needed
4. **Add new tests** for new functionality
5. **Run coverage**: `npm run test:coverage`
6. **Ensure coverage thresholds** are still met
7. **Add tests** if coverage dropped below thresholds

#### Before Task Completion:

1. **Run full coverage**: `npm run test:coverage`
2. **Review coverage report** in console output
3. **Open HTML report**: `npm run test:coverage:open`
4. **Identify uncovered lines** in the HTML report
5. **Add tests** for critical uncovered code
6. **Document** any intentionally untested code

### 📋 Coverage Quality Checklist

For each development task, ensure:

- [ ] All new functions/methods have tests
- [ ] All new routes have integration tests
- [ ] Error handling paths are tested
- [ ] Edge cases are covered
- [ ] Input validation is tested
- [ ] Coverage thresholds are met or improved
- [ ] No critical business logic is uncovered
- [ ] HTML coverage report shows green for new code

### 🚫 What NOT to Test (Excluded from Coverage)

**Already Excluded in Configuration:**
- Database migrations (`src/migrations/`)
- Database seeds (`src/seeds/`)
- Test files themselves
- Node modules

**Configuration Files (Exempt from Coverage Requirements):**
- **Application Bootstrap Files**: `app.js`, `index.js` - These files primarily wire up dependencies and start the application
- **Express Setup Files**: `express.js` - Files that configure middleware and routing without business logic
- **Configuration Files**: Files in `src/config/` that export static configuration objects
- **Simple Entry Points**: Files that only require and export other modules
- **Environment Setup**: Files that only set up environment variables or global configurations

**Rationale for Configuration File Exemption:**
- These files contain minimal business logic
- They primarily consist of framework setup and dependency wiring
- Testing them often requires complex mocking that provides little value
- Failures in these files are typically caught by integration tests
- The risk/benefit ratio of testing configuration code is low

**Generally Don't Need Coverage:**
- Simple getter/setter methods
- Basic configuration files
- Third-party library wrappers (unless adding logic)
- Pure configuration objects without logic
- Files that only export constants or static data

### 📊 Current Coverage Status (Final)

**Last Updated**: 2025-08-01

```
File            | % Stmts | % Branch | % Funcs | % Lines | Status
----------------|---------|----------|---------|---------|--------
All files       |   95.12 |     100  |   94.11 |   95.12 | ✅ EXCELLENT - Above all thresholds!
src/config/     |    100  |     100  |    100  |    100  | ✅ Perfect
src/handlers/   |    100  |     100  |    100  |    100  | ✅ Perfect  
src/models/     |      80 |     100  |   83.33 |      80  | ✅ Good
src/routes/     |    100  |     100  |    100  |    100  | ✅ Perfect
src/utils/      |    100  |     100  |    100  |    100  | ✅ Perfect
```

**Configuration Files (Excluded from Coverage):**
- `src/app.js` - Application bootstrap
- `src/express.js` - Express setup  
- `index.js` - Main entry point

**Removed Files:**
- ❌ `src/middleware/validation.js` - Removed (redundant with openapi-backend)
- ❌ `tests/middleware/validation.test.js` - Removed (no longer needed)

**Final Achievements:**
- 🎉 **Overall Coverage**: 95.12% statements (Target: 70%) - **EXCEEDED BY 25%**
- 🎉 **Branch Coverage**: 100% (Target: 70%) - **PERFECT SCORE**
- 🎉 **Function Coverage**: 94.11% (Target: 70%) - **EXCEEDED BY 24%**
- 🎉 **Line Coverage**: 95.12% (Target: 70%) - **EXCEEDED BY 25%**
- ✅ **All Components**: 80%+ coverage minimum achieved
- ✅ **Business Logic**: 100% coverage on all critical paths
- ✅ **API Endpoints**: 100% coverage on all routes
- ✅ **Error Handling**: Comprehensive error scenario testing

### 🎯 Coverage Improvement Strategies

#### For Handlers:
```javascript
// Example test structure for handlers
describe('Event Handlers', () => {
  test('should create event successfully', async () => {
    // Test happy path
  });
  
  test('should handle validation errors', async () => {
    // Test error conditions
  });
  
  test('should handle database errors', async () => {
    // Test database error scenarios
  });
});
```

#### For Models:
```javascript
// Example test structure for models
describe('Event Model', () => {
  test('should validate required fields', () => {
    // Test validation
  });
  
  test('should save to database', async () => {
    // Test database operations (mocked)
  });
});
```

#### For Routes (Branch Coverage):
```javascript
// Test all conditional branches
test('should handle optional parameters', async () => {
  // Test with and without optional params
});

test('should handle different content types', async () => {
  // Test different request formats
});
```

### 🔍 Coverage Analysis Commands

**View detailed coverage:**
```bash
npm run test:coverage:open  # Opens HTML report with line-by-line coverage
```

**Check specific files:**
```bash
npx jest --coverage --collectCoverageFrom="src/handlers/**/*.js"
```

**Coverage in CI/CD:**
```bash
npm run coverage:check  # Fails if thresholds not met
```

### 📝 Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Use Descriptive Test Names**: Clearly state what is being tested
3. **Mock External Dependencies**: Database, APIs, file system
4. **Test Edge Cases**: Empty inputs, null values, boundary conditions
5. **Test Error Conditions**: Network failures, validation errors, database errors
6. **Keep Tests Fast**: Use mocks and avoid real database calls
7. **Maintain Test Data**: Use factories or fixtures for consistent test data

### 🚨 Coverage Failure Protocol

If coverage thresholds are not met:

1. **Identify uncovered code** in HTML report
2. **Prioritize critical business logic** for testing
3. **Add focused tests** for uncovered lines
4. **Consider if code is actually needed** (remove dead code)
5. **Document intentionally untested code** with comments
6. **Update thresholds** only if justified (rare)

### 📈 Coverage Monitoring

**Weekly Review:**
- Check overall coverage trends
- Identify files with declining coverage
- Review new code coverage
- Update this memory bank if needed

**Before Releases:**
- Ensure all thresholds are met
- Review critical path coverage
- Generate coverage reports for documentation

## Coverage Configuration Details

### Jest Configuration

The coverage configuration in `jest.config.js`:

```javascript
module.exports = {
  // Coverage collection
  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: [
    'text',        // Console output
    'lcov',        // For CI/CD integration
    'html',        // Interactive HTML report
    'json'         // Machine-readable format
  ],
  
  // Files to include in coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/seeds/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
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

### Coverage Reports Structure

```
coverage/
├── lcov-report/           # HTML report (interactive)
│   ├── index.html         # Main coverage report
│   ├── src/
│   │   ├── handlers/
│   │   ├── models/
│   │   └── routes/
├── lcov.info             # LCOV format (for CI/CD)
├── coverage-final.json   # JSON format
└── clover.xml           # Clover format
```

### Understanding Coverage Metrics

#### Statements Coverage
- **Definition**: Percentage of executable statements that were executed
- **Goal**: Ensure all code paths are tested
- **Example**: `if (condition) { statement; }` - both the condition and statement count

#### Branch Coverage
- **Definition**: Percentage of decision branches that were executed
- **Goal**: Test all conditional paths (if/else, switch cases, ternary operators)
- **Example**: `if (condition)` - test both true and false paths

#### Function Coverage
- **Definition**: Percentage of functions that were called during tests
- **Goal**: Ensure all functions are tested
- **Example**: Every function definition should be invoked at least once

#### Line Coverage
- **Definition**: Percentage of executable lines that were executed
- **Goal**: Similar to statement coverage but line-based
- **Example**: Multi-statement lines count as one line

### Coverage Improvement Techniques

#### 1. Identify Uncovered Code

```bash
# Generate coverage and open HTML report
npm run test:coverage:open

# Look for red/yellow highlighted lines in the HTML report
# Focus on critical business logic first
```

#### 2. Add Targeted Tests

```javascript
// Example: Testing error conditions
describe('Error Handling', () => {
  test('should handle database connection errors', async () => {
    // Mock database to throw error
    jest.spyOn(Event, 'query').mockImplementation(() => {
      throw new Error('Database connection failed');
    });
    
    const response = await request(app)
      .get('/api/events')
      .expect(500);
    
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });
});
```

#### 3. Test Edge Cases

```javascript
// Example: Testing boundary conditions
describe('Input Validation', () => {
  test('should handle empty title', async () => {
    const response = await request(app)
      .post('/api/events')
      .send({
        title: '',  // Empty string
        startDate: '2025-08-01T10:00:00Z',
        endDate: '2025-08-01T11:00:00Z'
      })
      .expect(400);
  });
  
  test('should handle very long title', async () => {
    const longTitle = 'a'.repeat(1000);  // Very long string
    const response = await request(app)
      .post('/api/events')
      .send({
        title: longTitle,
        startDate: '2025-08-01T10:00:00Z',
        endDate: '2025-08-01T11:00:00Z'
      })
      .expect(400);
  });
});
```

#### 4. Test All Branches

```javascript
// Example: Testing conditional logic
const processEvent = (event) => {
  if (!event.title) {
    return { error: 'Title required' };
  }
  
  if (event.startDate > event.endDate) {
    return { error: 'Invalid date range' };
  }
  
  return { success: true, event };
};

// Tests for all branches
describe('processEvent', () => {
  test('should process valid event', () => {
    const result = processEvent({
      title: 'Test',
      startDate: '2025-08-01T10:00:00Z',
      endDate: '2025-08-01T11:00:00Z'
    });
    expect(result.success).toBe(true);
  });
  
  test('should reject event without title', () => {
    const result = processEvent({
      startDate: '2025-08-01T10:00:00Z',
      endDate: '2025-08-01T11:00:00Z'
    });
    expect(result.error).toBe('Title required');
  });
  
  test('should reject event with invalid date range', () => {
    const result = processEvent({
      title: 'Test',
      startDate: '2025-08-01T11:00:00Z',
      endDate: '2025-08-01T10:00:00Z'
    });
    expect(result.error).toBe('Invalid date range');
  });
});
```

### Continuous Integration Integration

#### GitHub Actions Example

```yaml
name: Test and Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests with coverage
      run: npm run test:coverage
      
    - name: Check coverage thresholds
      run: npm run coverage:check
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true
```

#### Coverage Badges

Add coverage badges to README.md:

```markdown
[![Coverage Status](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

---

**Remember: High test coverage doesn't guarantee bug-free code, but low coverage almost guarantees bugs will slip through. Aim for meaningful tests that cover real-world scenarios.**

## 🔗 Related Files

- `jest.config.js` - Coverage configuration
- `package.json` - Coverage scripts
- `tests/` - Test suite directory
- `coverage/lcov-report/index.html` - Detailed coverage report

## Related Documentation

- [Testing Guide](testing.md) - Comprehensive testing strategies
- [Development Guide](development.md) - Development workflow including testing
- [Installation Guide](installation.md) - Setting up the test environment

---

**Last Updated**: 2025-08-08
**Next Review**: When coverage drops below 90% overall or any file drops below its threshold
