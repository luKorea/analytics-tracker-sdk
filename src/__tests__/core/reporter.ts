import { Reporter } from '../../core/reporter';
import { StorageManager } from '../../utils/storage';

describe('Reporter', () => {
  let reporter: Reporter;
  let mockFetch: jest.SpyInstance;
  let mockStorage: jest.Mocked<StorageManager>;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    };

    mockFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve(new Response(null, { status: 200 })));

    reporter = new Reporter(
      {
        reportUrl: 'https://example.com/collect',
        batchSize: 2,
        reportInterval: 1000,
        debug: false,
      },
      mockStorage
    );
  });

  afterEach(() => {
    reporter.destroy();
    mockFetch.mockRestore();
    jest.clearAllMocks();
  });

  describe('Batch Reporting', () => {
    it('should batch events and report when reaching batch size', async () => {
      reporter.add({ type: 'event1', data: 'test1' });
      reporter.add({ type: 'event2', data: 'test2' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/collect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify([
            { type: 'event1', data: 'test1' },
            { type: 'event2', data: 'test2' },
          ]),
        })
      );
    });

    it('should report events when interval is reached', async () => {
      reporter.add({ type: 'event', data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/collect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify([{ type: 'event', data: 'test' }]),
        })
      );
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed requests', async () => {
      mockFetch
        .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
        .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 200 })));

      reporter.add({ type: 'event', data: 'test' });
      reporter.add({ type: 'event2', data: 'test2' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should store failed events for later retry', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      reporter.add({ type: 'event', data: 'test' });
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockStorage.set).toHaveBeenCalledWith(
        'failed_events',
        expect.arrayContaining([{ type: 'event', data: 'test' }])
      );
    });
  });

  describe('Offline Storage', () => {
    it('should store events when offline', () => {
      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', { value: false });

      reporter.add({ type: 'offline_event', data: 'test' });

      expect(mockStorage.set).toHaveBeenCalledWith(
        'offline_events',
        expect.arrayContaining([{ type: 'offline_event', data: 'test' }])
      );
    });

    it('should send stored events when back online', async () => {
      // 模拟存储的离线事件
      mockStorage.get.mockReturnValue([{ type: 'stored_event', data: 'test' }]);

      // 触发在线事件
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/collect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify([{ type: 'stored_event', data: 'test' }]),
        })
      );

      expect(mockStorage.remove).toHaveBeenCalledWith('offline_events');
    });
  });

  describe('Debug Mode', () => {
    it('should log events in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      reporter = new Reporter(
        {
          reportUrl: 'https://example.com/collect',
          debug: true,
        },
        mockStorage
      );

      reporter.add({ type: 'debug_event', data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
