/**
 * @jest-environment jsdom
 */

import { LocalStorage, MemoryStorage } from '../../utils/storage';

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as unknown as Storage;

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
};

global.console = { ...global.console, ...mockConsole };

describe('LocalStorage Edge Cases', () => {
  let localStorage: LocalStorage;

  beforeEach(() => {
    localStorage = new LocalStorage();
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('error handling', () => {
    it('should handle error when removing item', () => {
      const mockError = new Error('Remove error');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw mockError;
      });

      localStorage.remove('testKey');
      expect(mockConsole.error).toHaveBeenCalledWith('LocalStorage remove error:', mockError);
    });

    it('should handle error during clear operation', () => {
      const mockError = new Error('Clear error');
      Object.defineProperty(mockLocalStorage, 'length', { value: 1 });
      mockLocalStorage.key.mockImplementation(() => 'tracker_test');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw mockError;
      });

      localStorage.clear();
      expect(mockConsole.error).toHaveBeenCalledWith('LocalStorage clear error:', mockError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as key', () => {
      localStorage.set('', 'test');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tracker_', JSON.stringify('test'));
    });

    it('should handle special characters in key', () => {
      const specialKey = '!@#$%^&*()';
      localStorage.set(specialKey, 'test');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(`tracker_${specialKey}`, JSON.stringify('test'));
    });

    it('should handle circular references', () => {
      const circularObj: any = { prop: 'value' };
      circularObj.self = circularObj;

      localStorage.set('circular', circularObj);
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });
});

describe('MemoryStorage Edge Cases', () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
  });

  it('should handle undefined values', () => {
    memoryStorage.set('key', undefined);
    expect(memoryStorage.get('key')).toBeUndefined();
  });

  it('should handle null values', () => {
    memoryStorage.set('key', null);
    expect(memoryStorage.get('key')).toBeNull();
  });

  it('should handle complex objects', () => {
    const complexObj = {
      array: [1, 2, 3],
      nested: {
        a: 1,
        b: '2',
        c: true
      },
      date: new Date(),
      regex: /test/,
      func: function() {
        return undefined;
      }
    };

    memoryStorage.set('complex', complexObj);
    const retrieved = memoryStorage.get('complex');
    expect(retrieved).toEqual(complexObj);
  });

  it('should handle multiple operations in sequence', () => {
    memoryStorage.set('key1', 'value1');
    memoryStorage.set('key2', 'value2');
    memoryStorage.remove('key1');
    memoryStorage.set('key3', 'value3');
    memoryStorage.set('key2', 'updated');

    expect(memoryStorage.get('key1')).toBeUndefined();
    expect(memoryStorage.get('key2')).toBe('updated');
    expect(memoryStorage.get('key3')).toBe('value3');
  });
});