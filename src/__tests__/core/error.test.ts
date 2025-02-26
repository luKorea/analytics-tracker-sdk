import { ErrorMonitor } from '../../core/error';
import { ReporterImpl } from '../../core/reporter';

describe('ErrorMonitor', () => {
  let errorMonitor: ErrorMonitor;
  let mockReporter: jest.Mocked<ReporterImpl>;

  beforeEach(() => {
    mockReporter = {
      report: jest.fn(),
      batchReport: jest.fn(),
    } as jest.Mocked<ReporterImpl>;
    errorMonitor = new ErrorMonitor(mockReporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.onerror = null;
    window.onunhandledrejection = null;
  });

  it('should capture and report runtime error', () => {
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Test error'),
      message: 'Test error message',
    });

    window.dispatchEvent(errorEvent);

    expect(mockReporter.report).toHaveBeenCalledWith('error', {
      type: 'runtime_error',
      message: 'Test error message',
      stack: expect.any(String),
      timestamp: expect.any(Number),
    });
  });

  it('should capture and report unhandled promise rejection', () => {
    const promiseRejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      reason: new Error('Promise rejection'),
      promise: Promise.reject(new Error('Promise rejection')),
    });

    window.dispatchEvent(promiseRejectionEvent);

    expect(mockReporter.report).toHaveBeenCalledWith('error', {
      type: 'unhandled_rejection',
      message: 'Promise rejection',
      stack: expect.any(String),
      timestamp: expect.any(Number),
    });
  });

  it('should capture and report resource load error', () => {
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Failed to load script'),
      message: 'Failed to load script',
      filename: 'test.js',
    });

    window.dispatchEvent(errorEvent);

    expect(mockReporter.report).toHaveBeenCalledWith('error', {
      type: 'resource_error',
      message: 'Failed to load script',
      source: 'test.js',
      timestamp: expect.any(Number),
    });
  });

  it('should handle errors without stack trace', () => {
    const errorEvent = new ErrorEvent('error', {
      message: 'Error without stack',
    });

    window.dispatchEvent(errorEvent);

    expect(mockReporter.report).toHaveBeenCalledWith('error', {
      type: 'runtime_error',
      message: 'Error without stack',
      stack: '',
      timestamp: expect.any(Number),
    });
  });

  it('should stop monitoring when destroyed', () => {
    errorMonitor.destroy();

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Test error'),
      message: 'Test error message',
    });

    window.dispatchEvent(errorEvent);

    expect(mockReporter.report).not.toHaveBeenCalled();
  });
});
