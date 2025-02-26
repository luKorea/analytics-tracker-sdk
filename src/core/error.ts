import { ErrorData } from '../types';

/**
 * 错误监控类
 * 用于捕获和处理 JavaScript 运行时错误、资源加载错误、Promise 异常和 AJAX 请求错误
 */
export class ErrorMonitor {
  private errorCallback: (error: ErrorData) => void;

  /**
   * 创建错误监控实例
   * @param callback - 错误处理回调函数，用于处理捕获到的错误
   */
  constructor(callback: (error: ErrorData) => void) {
    this.errorCallback = callback;
    this.init();
  }

  /**
   * 初始化错误监控
   * 设置各类错误的事件监听器
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    // 监听 JS 运行时错误
    window.addEventListener('error', this.handleError, true);

    // 监听未捕获的 Promise 异常
    window.addEventListener('unhandledrejection', this.handlePromiseError);

    // 重写 XMLHttpRequest 以捕获 AJAX 错误
    this.patchXMLHttpRequest();
  }

  /**
   * 重写 XMLHttpRequest 以监控 AJAX 请求错误
   */
  private patchXMLHttpRequest(): void {
    const originalXHR = window.XMLHttpRequest;
    const errorCallback = this.errorCallback;

    // 扩展 XMLHttpRequest 类型
    interface ExtendedXMLHttpRequest extends XMLHttpRequest {
      _url?: string;
    }

    window.XMLHttpRequest = function(this: ExtendedXMLHttpRequest) {
      const xhr = new originalXHR() as ExtendedXMLHttpRequest;
      const originalOpen = xhr.open;
      const originalSend = xhr.send;

      xhr.open = function(this: ExtendedXMLHttpRequest, method: string, url: string | URL, ...args: any[]) {
        this._url = url.toString();
        return originalOpen.apply(this, [method, url, ...args]);
      };

      xhr.send = function(this: ExtendedXMLHttpRequest, ...args: any[]) {
        this.addEventListener('error', () => {
          errorCallback({
            type: 'ajax',
            message: `Ajax request failed: ${this._url}`,
            timestamp: Date.now(),
            filename: this._url
          });
        });

        this.addEventListener('timeout', () => {
          errorCallback({
            type: 'ajax',
            message: `Ajax request timeout: ${this._url}`,
            timestamp: Date.now(),
            filename: this._url
          });
        });

        return originalSend.apply(this, args);
      };

      return xhr;
    } as unknown as typeof XMLHttpRequest;
  }

  /**
   * 处理 JavaScript 运行时错误和资源加载错误
   * @param event - 错误事件对象
   */
  private handleError = (event: ErrorEvent | Event): void => {
    if (event instanceof ErrorEvent) {
      // JavaScript 运行时错误
      this.errorCallback({
        type: 'js',
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        timestamp: Date.now()
      });
    } else {
      // 资源加载错误
      const target = event.target as HTMLElement;
      this.errorCallback({
        type: 'resource',
        message: `Resource load failed: ${target.outerHTML}`,
        filename: (target as HTMLScriptElement | HTMLLinkElement | HTMLImageElement).src || (target as HTMLScriptElement | HTMLLinkElement).href || 'unknown',
        timestamp: Date.now()
      });
    }
  };

  /**
   * 处理未捕获的 Promise 异常
   * @param event - Promise 异常事件对象
   */
  private handlePromiseError = (event: PromiseRejectionEvent): void => {
    this.errorCallback({
      type: 'promise',
      message: event.reason?.message || 'Promise rejection',
      stack: event.reason?.stack,
      timestamp: Date.now()
    });
  };

  /**
   * 销毁错误监控实例
   * 移除所有事件监听器
   */
  destroy(): void {
    window.removeEventListener('error', this.handleError, true);
    window.removeEventListener('unhandledrejection', this.handlePromiseError);
  }
}

/**
 * 创建错误监控实例
 * @param callback - 错误处理回调函数
 */
export const createErrorMonitor = (callback: (error: ErrorData) => void) => {
  return new ErrorMonitor(callback);
};