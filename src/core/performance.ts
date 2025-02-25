import { PerformanceData } from '../types';

/**
 * 性能监控类
 * 用于收集和监控页面性能指标，包括 FCP、LCP、FID、CLS 等核心性能指标
 */
export class PerformanceMonitor {
  private performanceData: PerformanceData = {};
  private observer: PerformanceObserver | null = null;

  /**
   * 创建性能监控实例
   * 初始化性能观察器，开始收集性能指标
   */
  constructor() {
    this.initObserver();
  }

  /**
   * 初始化性能观察器
   * 设置各项性能指标的观察器，包括 FCP、LCP、FID、CLS 等
   */
  private initObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // 监控首次内容绘制 (FCP)
      const fcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const fcp = entries[0];
        if (fcp) {
          this.performanceData.fcp = fcp.startTime;
          fcpObserver.disconnect();
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // 监控最大内容绘制 (LCP)
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.performanceData.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // 监控首次输入延迟 (FID)
      const fidObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const firstInput = entries[0];
        if (firstInput) {
          this.performanceData.fid = firstInput.processingStart - firstInput.startTime;
          fidObserver.disconnect();
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // 监控累积布局偏移 (CLS)
      let clsValue = 0;
      let clsEntries: any[] = [];
      const clsObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];
            if (
              firstSessionEntry &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              clsEntries.push(entry);
            } else {
              clsEntries = [entry];
            }
            if (clsEntries.length >= 1) {
              const clsSession = clsEntries.reduce((sum, entry) => sum + entry.value, 0);
              clsValue = Math.max(clsValue, clsSession);
              this.performanceData.cls = clsValue;
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observer = clsObserver;
    } catch (error) {
      console.error('Performance observer error:', error);
    }
  }

  /**
   * 收集导航计时指标
   * 包括页面加载时间、DOM 解析时间等
   */
  collectNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance || !window.performance.timing) return;

    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domParseTime = timing.domComplete - timing.domLoading;

    this.performanceData.loadTime = loadTime > 0 ? loadTime : undefined;
    this.performanceData.domParseTime = domParseTime > 0 ? domParseTime : undefined;
  }

  /**
   * 获取收集到的性能指标数据
   * @returns 包含各项性能指标的数据对象
   */
  getMetrics(): PerformanceData {
    this.collectNavigationTiming();
    return this.performanceData;
  }

  /**
   * 销毁性能监控实例
   * 断开所有性能观察器的连接
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * 创建性能监控实例的工厂函数
 * @returns PerformanceMonitor 实例
 */
export const createPerformanceMonitor = (): PerformanceMonitor => {
  return new PerformanceMonitor();
};
