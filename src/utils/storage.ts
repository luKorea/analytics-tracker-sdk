import { Storage } from '../types';

/**
 * 本地存储实现类，使用 localStorage 作为存储介质
 * 支持数据的持久化存储，并提供前缀隔离机制
 */
export class LocalStorage implements Storage {
  private prefix: string;

  /**
   * 创建 LocalStorage 实例
   * @param prefix - 存储键的前缀，默认为 'tracker_'
   */
  constructor(prefix = 'tracker_') {
    this.prefix = prefix;
  }

  /**
   * 获取带前缀的完整存储键
   * @param key - 原始键名
   * @returns 带前缀的完整键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 获取存储的值
   * @param key - 存储键名
   * @returns 存储的值，如果不存在或解析失败则返回 null
   */
  get(key: string): any {
    try {
      const value = localStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  /**
   * 设置存储值
   * @param key - 存储键名
   * @param value - 要存储的值，会被自动序列化为 JSON 字符串
   */
  set(key: string, value: any): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }

  /**
   * 移除指定键的存储值
   * @param key - 要移除的存储键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorage remove error:', error);
    }
  }

  /**
   * 清除所有带有指定前缀的存储项
   */
  clear(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }
}

/**
 * 内存存储实现类，使用 Map 作为存储介质
 * 用于在不支持 localStorage 的环境中提供备选方案
 */
export class MemoryStorage implements Storage {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
  }

  /**
   * 获取存储的值
   * @param key - 存储键名
   * @returns 存储的值，如果不存在则返回 undefined
   */
  get(key: string): any {
    return this.storage.get(key);
  }

  /**
   * 设置存储值
   * @param key - 存储键名
   * @param value - 要存储的值
   */
  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  /**
   * 移除指定键的存储值
   * @param key - 要移除的存储键名
   */
  remove(key: string): void {
    this.storage.delete(key);
  }

  /**
   * 清除所有存储项
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * 创建存储实例的工厂函数
 * @param type - 存储类型，可选 'local' 或 'memory'，默认为 'local'
 * @param prefix - 存储键的前缀，仅在使用 LocalStorage 时有效
 * @returns Storage 实例
 */
export const createStorage = (type: 'local' | 'memory' = 'local', prefix?: string): Storage => {
  try {
    if (type === 'local' && typeof window !== 'undefined' && window.localStorage) {
      return new LocalStorage(prefix);
    }
  } catch (error) {
    console.warn('LocalStorage not available, fallback to MemoryStorage');
  }
  return new MemoryStorage();
};
