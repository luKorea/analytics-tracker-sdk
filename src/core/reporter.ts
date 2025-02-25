import { EventData, Reporter } from '../types';

/**
 * 批量上报器实现类
 * 支持数据批量发送、自动重试、离线缓存等特性
 */
export class BatchReporter implements Reporter {
  private queue: EventData[] = [];
  private timer: NodeJS.Timeout | null = null;
  private sending = false;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly maxQueueSize = 1000; // 队列最大容量
  private offlineStorage: Storage | null = null;

  /**
   * 创建批量上报器实例
   * @param reportUrl - 数据上报的目标 URL
   * @param batchSize - 每次批量发送的数据量，默认为 10
   * @param reportInterval - 定时上报的时间间隔（毫秒），默认为 5000
   * @param headers - 请求头配置
   */
  constructor(
    private readonly reportUrl: string,
    private readonly batchSize: number = 10,
    private readonly reportInterval: number = 5000,
    private readonly headers: Record<string, string> = {}
  ) {
    this.initOfflineStorage();
    this.processOfflineData();
  }

  /**
   * 初始化离线存储
   */
  private initOfflineStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.offlineStorage = window.localStorage;
      window.addEventListener('online', this.processOfflineData.bind(this));
    }
  }

  /**
   * 处理离线数据
   */
  private async processOfflineData(): Promise<void> {
    if (!this.offlineStorage) return;

    const offlineData = this.offlineStorage.getItem('offline_events');
    if (offlineData) {
      try {
        const events = JSON.parse(offlineData);
        await this.send(events);
        this.offlineStorage.removeItem('offline_events');
      } catch (error) {
        console.error('Process offline data error:', error);
      }
    }
  }

  /**
   * 发送请求
   * @param events - 要上报的事件数据数组
   */
  private async sendRequest(events: EventData[]): Promise<void> {
    try {
      const response = await fetch(this.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          events,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.retryCount = 0;
    } catch (error) {
      console.error('Report error:', error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        await this.sendRequest(events);
      } else {
        this.retryCount = 0;
        throw error;
      }
    }
  }

  private isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  private scheduleReport(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.batchSend(this.queue);
    }, this.reportInterval);
  }

  async send(events: EventData[]): Promise<void> {
    if (!this.isOnline()) {
      this.queue.push(...events);
      return;
    }

    try {
      await this.sendRequest(events);
    } catch (error) {
      this.queue.push(...events);
    }
  }

  batchSend(events: EventData[]): void {
    if (this.sending || events.length === 0) return;

    this.sending = true;

    try {
      while (events.length > 0) {
        const batch = events.splice(0, this.batchSize);
        this.send(batch);
      }
    } finally {
      this.sending = false;
    }

    if (this.queue.length >= this.batchSize) {
      this.batchSend(this.queue);
    } else if (this.queue.length > 0) {
      this.scheduleReport();
    }
  }
}

export const createReporter = (
  reportUrl: string,
  batchSize?: number,
  reportInterval?: number,
  headers?: Record<string, string>
): Reporter => {
  return new BatchReporter(reportUrl, batchSize, reportInterval, headers);
};
