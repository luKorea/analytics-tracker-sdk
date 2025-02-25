import { v4 as uuidv4 } from 'uuid';
import {
  TrackerConfig,
  TrackerInstance,
  EventData,
  EventType,
  UserInfo,
  Storage,
  Reporter,
} from './types';
import { createStorage } from './utils/storage';
import { createReporter } from './core/reporter';
import { createPerformanceMonitor } from './core/performance';
import { createErrorMonitor } from './core/error';

class Tracker implements TrackerInstance {
  private config: TrackerConfig;
  private storage: Storage;
  private reporter: Reporter;
  private performanceMonitor: ReturnType<typeof createPerformanceMonitor>;
  private errorMonitor: ReturnType<typeof createErrorMonitor>;
  private initialized = false;

  constructor() {
    this.storage = createStorage('local', 'tracker_');
  }

  init(config: TrackerConfig): void {
    if (this.initialized) {
      console.warn('Tracker has already been initialized');
      return;
    }

    this.config = {
      autoTrackPageView: true,
      autoTrackClick: true,
      autoTrackPerformance: true,
      autoTrackError: true,
      batchSize: 10,
      reportInterval: 5000,
      debug: false,
      samplingRate: 1,
      ...config,
    };

    this.reporter = createReporter(
      this.config.reportUrl,
      this.config.batchSize,
      this.config.reportInterval,
      this.config.headers
    );

    if (this.config.autoTrackPerformance) {
      this.performanceMonitor = createPerformanceMonitor();
    }

    if (this.config.autoTrackError) {
      this.errorMonitor = createErrorMonitor(error => {
        this.track('error', error);
      });
    }

    if (this.config.autoTrackPageView) {
      this.trackPageView();
      window.addEventListener('popstate', this.trackPageView.bind(this));
      window.addEventListener('hashchange', this.trackPageView.bind(this));
    }

    if (this.config.autoTrackClick) {
      window.addEventListener('click', this.handleClick.bind(this), true);
    }

    this.initialized = true;

    if (this.config.debug) {
      console.log('Tracker initialized with config:', this.config);
    }
  }

  private shouldSample(): boolean {
    return Math.random() < (this.config.samplingRate || 1);
  }

  private createEvent(type: EventType, data: Record<string, any>): EventData {
    return {
      id: uuidv4(),
      type,
      timestamp: Date.now(),
      data: {
        ...data,
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        ...this.getUserInfo(),
      },
    };
  }

  private trackPageView(): void {
    if (!this.shouldSample()) return;

    const performanceData = this.performanceMonitor?.getMetrics() || {};
    this.track('page_view', {
      path: window.location.pathname,
      performance: performanceData,
    });
  }

  private handleClick(event: MouseEvent): void {
    if (!this.shouldSample()) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    const trackData = {
      tag: target.tagName.toLowerCase(),
      text: target.textContent?.trim(),
      className: target.className,
      id: target.id,
      path: this.getElementPath(target),
    };

    this.track('click', trackData);
  }

  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let currentElement: HTMLElement | null = element;

    while (currentElement && currentElement !== document.body) {
      let selector = currentElement.tagName.toLowerCase();
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
      } else if (currentElement.className) {
        selector += `.${currentElement.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      currentElement = currentElement.parentElement;
    }

    return path.join(' > ');
  }

  track(eventType: EventType, data: Record<string, any>): void {
    if (!this.initialized) {
      console.error('Tracker not initialized');
      return;
    }

    if (!this.shouldSample()) return;

    const event = this.createEvent(eventType, data);
    this.reporter.batchSend([event]);

    if (this.config.debug) {
      this.logger.debug('Event tracked:', eventData);
    }
  }

  setUser(userInfo: Partial<UserInfo>): void {
    const currentInfo = this.getUserInfo();
    this.storage.set('user', { ...currentInfo, ...userInfo });
  }

  private getUserInfo(): Partial<UserInfo> {
    return this.storage.get('user') || {};
  }

  clearUser(): void {
    this.storage.remove('user');
  }

  destroy(): void {
    if (!this.initialized) return;

    if (this.config.autoTrackPageView) {
      window.removeEventListener('popstate', this.trackPageView.bind(this));
      window.removeEventListener('hashchange', this.trackPageView.bind(this));
    }

    if (this.config.autoTrackClick) {
      window.removeEventListener('click', this.handleClick.bind(this), true);
    }

    this.performanceMonitor?.destroy();
    this.errorMonitor?.destroy();
    this.storage.clear();
    this.initialized = false;
  }
}

export const createTracker = (): TrackerInstance => {
  return new Tracker();
};

export * from './types';
