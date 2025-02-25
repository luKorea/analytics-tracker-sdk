import { ErrorTracker } from '../../core/error';

describe('ErrorTracker', () => {
  let errorTracker: ErrorTracker;
  let mockReporter: jest.Mock;

  beforeEach(() => {
    mockReporter = jest.fn();
    errorTracker = new ErrorTracker(mockReporter);
  });

  afterEach(() => {
    errorTracker.destroy();
    jest.clearAllMocks();
  });

  describe('Runtime Error', () => {
    it('should capture runtime error', () => {
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test runtime error'),
        message: 'Test runtime error',
      });

      window.dispatchEvent(errorEvent);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'error',
        subType: 'runtime',
        message: 'Test runtime error',
        stack: expect.any(String),
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Promise Error', () => {
    it('should capture unhandled promise rejection', () => {
      const error = new Error('Test promise error');
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(error),
        reason: error,
      });

      window.dispatchEvent(event);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'error',
        subType: 'promise',
        message: 'Test promise error',
        stack: expect.any(String),
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Resource Error', () => {
    it('should capture resource loading error', () => {
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Failed to load script'),
        message: 'Failed to load script',
        filename: 'test.js',
      });

      window.dispatchEvent(errorEvent);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'error',
        subType: 'resource',
        message: 'Failed to load script',
        source: 'test.js',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('AJAX Error', () => {
    it('should capture AJAX error', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://example.com/api');
      xhr.send();

      const errorEvent = new ErrorEvent('error', {
        error: new Error('Network error'),
        message: 'Network error',
      });

      xhr.dispatchEvent(errorEvent);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'error',
        subType: 'ajax',
        message: 'Network error',
        url: 'http://example.com/api',
        method: 'GET',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Error Context', () => {
    it('should include error context information', () => {
      const error = new Error('Test error with context');
      error.stack = 'Error: Test error with context\n    at test.js:10:20';

      const errorEvent = new ErrorEvent('error', {
        error,
        message: error.message,
      });

      window.dispatchEvent(errorEvent);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'error',
        subType: 'runtime',
        message: 'Test error with context',
        stack: expect.any(String),
        timestamp: expect.any(Number),
        context: expect.any(Object),
      });
    });
  });
});
