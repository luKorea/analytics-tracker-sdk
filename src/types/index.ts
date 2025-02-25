// 事件类型定义
export type EventType = 'page_view' | 'click' | 'custom' | 'performance' | 'error';

// 事件数据接口
export interface EventData {
  id: string;
  type: EventType;
  timestamp: number;
  data: Record<string, any>;
}

// SDK 配置接口
export interface TrackerConfig {
  // 数据上报地址
  reportUrl: string;
  // 应用标识
  appId: string;
  // 是否自动采集页面访问
  autoTrackPageView?: boolean;
  // 是否自动采集点击事件
  autoTrackClick?: boolean;
  // 是否自动采集性能数据
  autoTrackPerformance?: boolean;
  // 是否自动采集错误信息
  autoTrackError?: boolean;
  // 批量上报的阈值
  batchSize?: number;
  // 上报间隔（毫秒）
  reportInterval?: number;
  // 是否开启调试模式
  debug?: boolean;
  // 自定义上报请求头
  headers?: Record<string, string>;
  // 采样率 (0-1)
  samplingRate?: number;
}

// 性能数据接口
export interface PerformanceData {
  // 页面加载时间
  loadTime?: number;
  // DOM 解析时间
  domParseTime?: number;
  // 首次内容绘制时间
  fcp?: number;
  // 最大内容绘制时间
  lcp?: number;
  // 首次输入延迟
  fid?: number;
  // 累积布局偏移
  cls?: number;
}

// 错误数据接口
export interface ErrorData {
  type: 'js' | 'resource' | 'promise' | 'ajax';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
}

// 用户信息接口
export interface UserInfo {
  userId?: string;
  deviceId?: string;
  userAgent: string;
  platform: string;
  screenResolution?: string;
  language?: string;
  [key: string]: any;
}

// 存储接口
export interface Storage {
  get(key: string): any;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}

// 上报器接口
export interface Reporter {
  send(events: EventData[]): Promise<void>;
  batchSend(events: EventData[]): void;
}

// SDK 实例接口
export interface TrackerInstance {
  init(config: TrackerConfig): void;
  track(eventType: EventType, data: Record<string, any>): void;
  setUser(userInfo: Partial<UserInfo>): void;
  clearUser(): void;
  destroy(): void;
}
