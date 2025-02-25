import { PerformanceMonitor } from '../../core/performance';
import { Reporter } from '../../core/reporter';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;
  let mockReporter: jest.Mocked<Reporter>;

  beforeEach(() => {
    mockReporter = {
      report: jest.fn(),
      batchReport: jest.fn(),
    } as any;
    performanceMonitor = new PerformanceMonitor(mockReporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should collect and report page load timing', () => {
    const mockTiming = {
      navigationStart: 1000,
      loadEventEnd: 2000,
      domContentLoadedEventEnd: 1500,
      domInteractive: 1200,
    };

    Object.defineProperty(window.performance, 'timing', {
      value: mockTiming,
      configurable: true,
    });

    performanceMonitor.collectPageLoadTiming();

    expect(mockReporter.report).toHaveBeenCalledWith('performance', {
      type: 'page_load',
      loadTime: 1000,
      domContentLoadedTime: 500,
      domInteractiveTime: 200,
      timestamp: expect.any(Number),
    });
  });

  it('should collect and report web vitals', () => {
    const mockLCP = {
      name: 'LCP',
      value: 2500,
      entryType: 'largest-contentful-paint',
    };

    const mockFID = {
      name: 'FID',
      value: 100,
      entryType: 'first-input',
    };

    const mockCLS = {
      name: 'CLS',
      value: 0.1,
      entryType: 'layout-shift',
    };

    jest.spyOn(window.performance, 'getEntriesByType').mockImplementation(type => {
      switch (type) {
        case 'largest-contentful-paint':
          return [mockLCP];
        case 'first-input':
          return [mockFID];
        case 'layout-shift':
          return [mockCLS];
        default:
          return [];
      }
    });

    performanceMonitor.collectWebVitals();

    expect(mockReporter.report).toHaveBeenCalledWith('performance', {
      type: 'web_vitals',
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      timestamp: expect.any(Number),
    });
  });

  it('should handle missing performance metrics', () => {
    jest.spyOn(window.performance, 'getEntriesByType').mockReturnValue([]);

    performanceMonitor.collectWebVitals();

    expect(mockReporter.report).toHaveBeenCalledWith('performance', {
      type: 'web_vitals',
      lcp: 0,
      fid: 0,
      cls: 0,
      timestamp: expect.any(Number),
    });
  });

  it('should stop monitoring when destroyed', () => {
    performanceMonitor.destroy();
    performanceMonitor.collectPageLoadTiming();
    performanceMonitor.collectWebVitals();

    expect(mockReporter.report).not.toHaveBeenCalled();
  });
});
