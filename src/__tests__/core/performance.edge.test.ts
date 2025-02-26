import { PerformanceMonitor } from '../../core/performance';
import { Reporter } from '../../core/reporter';

describe('PerformanceMonitor Edge Cases', () => {
  let performanceMonitor: PerformanceMonitor;
  let mockReporter: jest.Mocked<Reporter>;

  beforeEach(() => {
    mockReporter = {
      report: jest.fn(),
      batchReport: jest.fn(),
    } as jest.Mocked<Reporter>;
    performanceMonitor = new PerformanceMonitor(mockReporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('error handling', () => {
    it('should handle undefined performance timing', () => {
      Object.defineProperty(window, 'performance', {
        value: undefined,
        configurable: true
      });

      performanceMonitor.collectPageLoadTiming();

      expect(mockReporter.report).toHaveBeenCalledWith('performance', {
        type: 'page_load',
        loadTime: 0,
        domContentLoadedTime: 0,
        domInteractiveTime: 0,
        timestamp: expect.any(Number),
      });
    });

    it('should handle invalid timing values', () => {
      const mockTiming = {
        navigationStart: undefined,
        loadEventEnd: null,
        domContentLoadedEventEnd: NaN,
        domInteractive: -1,
      };

      Object.defineProperty(window.performance, 'timing', {
        value: mockTiming,
        configurable: true,
      });

      performanceMonitor.collectPageLoadTiming();

      expect(mockReporter.report).toHaveBeenCalledWith('performance', {
        type: 'page_load',
        loadTime: 0,
        domContentLoadedTime: 0,
        domInteractiveTime: 0,
        timestamp: expect.any(Number),
      });
    });

    it('should handle performance.getEntriesByType throwing error', () => {
      jest.spyOn(window.performance, 'getEntriesByType').mockImplementation(() => {
        throw new Error('Not supported');
      });

      performanceMonitor.collectWebVitals();

      expect(mockReporter.report).toHaveBeenCalledWith('performance', {
        type: 'web_vitals',
        lcp: 0,
        fid: 0,
        cls: 0,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('edge cases', () => {
    it('should handle extremely large timing values', () => {
      const mockTiming = {
        navigationStart: 1,
        loadEventEnd: Number.MAX_SAFE_INTEGER,
        domContentLoadedEventEnd: Number.MAX_SAFE_INTEGER - 1000,
        domInteractive: Number.MAX_SAFE_INTEGER - 2000,
      };

      Object.defineProperty(window.performance, 'timing', {
        value: mockTiming,
        configurable: true,
      });

      performanceMonitor.collectPageLoadTiming();

      expect(mockReporter.report).toHaveBeenCalledWith('performance', {
        type: 'page_load',
        loadTime: expect.any(Number),
        domContentLoadedTime: expect.any(Number),
        domInteractiveTime: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });

    it('should handle multiple web vital entries', () => {
      const mockEntries = [
        { name: 'LCP', value: 1000, entryType: 'largest-contentful-paint' },
        { name: 'LCP', value: 2000, entryType: 'largest-contentful-paint' },
        { name: 'FID', value: 50, entryType: 'first-input' },
        { name: 'FID', value: 100, entryType: 'first-input' },
        { name: 'CLS', value: 0.1, entryType: 'layout-shift' },
        { name: 'CLS', value: 0.2, entryType: 'layout-shift' },
      ];

      jest.spyOn(window.performance, 'getEntriesByType').mockImplementation(type => {
        switch (type) {
          case 'largest-contentful-paint':
            return mockEntries.filter(entry => entry.entryType === type);
          case 'first-input':
            return mockEntries.filter(entry => entry.entryType === type);
          case 'layout-shift':
            return mockEntries.filter(entry => entry.entryType === type);
          default:
            return [];
        }
      });

      performanceMonitor.collectWebVitals();

      expect(mockReporter.report).toHaveBeenCalledWith('performance', {
        type: 'web_vitals',
        lcp: 2000, // Should use the latest LCP value
        fid: 100, // Should use the latest FID value
        cls: 0.3, // Should accumulate CLS values
        timestamp: expect.any(Number),
      });
    });
  });
});