const { getApiInfo } = require('../../src/handlers/general');

describe('General Handlers', () => {
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

  describe('getApiInfo', () => {
    it('should return API information successfully', async () => {
      await getApiInfo(mockContext, mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Calendar App API',
        version: '1.0.0',
        status: 'running'
      });
    });

  });
});
