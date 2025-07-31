# Code Coverage Memory Bank

## Critical Instructions for Future LLMs

This file serves as a memory bank to ensure code coverage standards are maintained and improved throughout the project lifecycle.

### 🚨 MANDATORY REQUIREMENTS

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

**Generally Don't Need Coverage:**
- Simple getter/setter methods
- Basic configuration files
- Third-party library wrappers (unless adding logic)

### 📊 Current Coverage Status (Baseline)

**Last Updated**: 2025-07-31

```
File            | % Stmts | % Branch | % Funcs | % Lines | Status
----------------|---------|----------|---------|---------|--------
All files       |   38.51 |    36.56 |   30.76 |    39.2 | ❌ Below threshold
src/routes/     |    100  |     50   |    100  |    100  | ⚠️  Branches need work
src/middleware/ |   51.96 |    53.4  |   63.63 |   53.22 | ❌ Below threshold
src/handlers/   |       0 |        0 |       0 |       0 | ❌ No tests
src/models/     |       0 |        0 |       0 |       0 | ❌ No tests
src/utils/      |       0 |        0 |       0 |       0 | ❌ No tests
```

**Priority Areas for Improvement:**
1. **Handlers** - 0% coverage (CRITICAL)
2. **Models** - 0% coverage (HIGH)
3. **Utils** - 0% coverage (MEDIUM)
4. **Middleware** - Below threshold (MEDIUM)
5. **Routes** - Branch coverage needs improvement (LOW)

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

---

**Remember: High test coverage doesn't guarantee bug-free code, but low coverage almost guarantees bugs will slip through. Aim for meaningful tests that cover real-world scenarios.**

## 🔗 Related Files

- `jest.config.js` - Coverage configuration
- `package.json` - Coverage scripts
- `tests/app.test.js` - Current test suite
- `README.md` - Coverage documentation
- `coverage/lcov-report/index.html` - Detailed coverage report

---

**Last Updated**: 2025-07-31
**Next Review**: When coverage drops below 35% overall or any file drops below its threshold
