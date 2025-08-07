const { getHealthStatus } = require('../../src/handlers/health');

describe('Health Handlers', () => {
  let mockReq, mockRes, mockContext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockContext = {};
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getHealthStatus', () => {
    it('should return health status successfully', async () => {
      // Mock Date to have predictable timestamp
      const mockDate = new Date('2025-07-28T10:00:00.000Z');
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate);
      global.Date.prototype.toISOString = jest.fn(() => mockDate.toISOString());

      await getHealthStatus(mockContext, mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: '2025-07-28T10:00:00.000Z'
      });

      // Restore original Date
      global.Date = originalDate;
    });

  });
});
