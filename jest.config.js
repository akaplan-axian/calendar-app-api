module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Only collect when explicitly requested
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/migrations/**',
    '!**/seeds/**'
  ],
  
  // Coverage thresholds - adjust these based on your project needs
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // You can set specific thresholds for individual files/directories
    './src/routes/': {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Brief summary
    'html',           // HTML report in coverage/lcov-report/
    'lcov',           // For CI/CD integration
    'json'            // Machine-readable format
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Setup files (if needed)
  setupFilesAfterEnv: [],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
};
