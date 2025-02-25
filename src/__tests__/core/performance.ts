import { PerformanceTracker } from '../../core/performance';

describe('PerformanceTracker', () => {
  let performanceTracker: PerformanceTracker;
  let mockReporter: jest.Mock;

  beforeEach(() => {
    mockReporter = jest.fn();
    performanceTracker = new PerformanceTracker(mockReporter);
  });

  afterEach(() => {
    performanceTracker.destroy();
    jest.clearAllMocks();
  });

  describe('Page Load Performance', () => {
    it('should track page load timing', () => {
      const mockTiming = {
        navigationStart: 1000,
        loadEventEnd: 2000,
        domContentLoadedEventEnd: 1500,
        domInteractive: 1300,
      };

      Object.defineProperty(window.performance, 'timing', {
        get: () => mockTiming,
      });

      performanceTracker.trackPageLoad();

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'performance',
        subType: 'page_load',
        metrics: {
          loadTime: 1000,
          domContentLoaded: 500,
          domInteractive: 300,
        },
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Web Vitals', () => {
    it('should track LCP', () => {
      const mockEntry = {
        startTime: 2000,
        renderTime: 2500,
        size: 50000,
        id: 'mock-element',
        url: '',
        element: document.createElement('div'),
      };

      performanceTracker.trackLCP(mockEntry);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'performance',
        subType: 'web_vitals',
        name: 'LCP',
        value: 2500,
        timestamp: expect.any(Number),
      });
    });

    it('should track FID', () => {
      const mockEntry = {
        startTime: 1000,
        processingStart: 1050,
        processingEnd: 1100,
        duration: 50,
      };

      performanceTracker.trackFID(mockEntry);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'performance',
        subType: 'web_vitals',
        name: 'FID',
        value: 50,
        timestamp: expect.any(Number),
      });
    });

    it('should track CLS', () => {
      const mockEntry = {
        value: 0.1,
        sources: [],
      };

      performanceTracker.trackCLS(mockEntry);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'performance',
        subType: 'web_vitals',
        name: 'CLS',
        value: 0.1,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Custom Performance Metrics', () => {
    it('should track custom metric', () => {
      const metricName = 'custom_timing';
      const metricValue = 1500;

      performanceTracker.trackCustomMetric(metricName, metricValue);

      expect(mockReporter).toHaveBeenCalledWith({
        type: 'performance',
        subType: 'custom',
        name: metricName,
        value: metricValue,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Performance Observer', () => {
    it('should setup performance observers', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn(),
      };

      // 使用类型断言替代 @ts-ignore
      global.PerformanceObserver = jest.fn(
        () => mockObserver
      ) as unknown as typeof PerformanceObserver;

      performanceTracker.init();

      expect(global.PerformanceObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalled();
    });
  });
});
