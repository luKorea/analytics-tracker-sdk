/**
 * @jest-environment jsdom
 */

import { Storage, LocalStorage, MemoryStorage, createStorage } from '../../utils/storage';

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = mockLocalStorage;

const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
};

global.console = { ...global.console, ...mockConsole };

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new Storage();
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('get', () => {
    it('should correctly get stored value', () => {
      const testData = { data: 'test' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));
      expect(storage.get('testKey')).toEqual(testData);
    });

    it('should return null when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(storage.get('nonexistentKey')).toBeNull();
    });

    it('should return null when value is not valid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      expect(storage.get('invalidKey')).toBeNull();
    });

    it('should return null when localStorage.getItem throws error', () => {
      const mockError = new Error('Storage error');
      mockLocalStorage.getItem.mockImplementation(() => {
        throw mockError;
      });

      expect(storage.get('testKey')).toBeNull();
      expect(mockConsole.error).toHaveBeenCalledWith('Storage get error:', mockError);
    });
  });

  describe('set', () => {
    it('should correctly set value', () => {
      const testData = { data: 'test' };
      storage.set('testKey', testData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData));
    });

    it('should handle storage errors', () => {
      const mockError = new Error('Storage error');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw mockError;
      });

      storage.set('testKey', { data: 'test' });
      expect(mockConsole.error).toHaveBeenCalledWith('Storage set error:', mockError);
    });

    it('should handle undefined and null values', () => {
      storage.set('nullKey', null);
      storage.set('undefinedKey', undefined);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nullKey', 'null');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('undefinedKey', 'null');
    });
  });

  describe('remove', () => {
    it('should correctly remove value', () => {
      storage.remove('testKey');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('should not throw error when removing non-existent key', () => {
      expect(() => storage.remove('nonexistentKey')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      storage.clear();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });
});

describe('LocalStorage', () => {
  let localStorage: LocalStorage;

  beforeEach(() => {
    localStorage = new LocalStorage('test_');
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('should use prefix for storage keys', () => {
    const testData = { data: 'test' };
    localStorage.set('key', testData);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(testData));
  });

  it('should get prefixed values', () => {
    const testData = { data: 'test' };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));
    expect(localStorage.get('key')).toEqual(testData);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
  });

  it('should remove prefixed values', () => {
    localStorage.remove('key');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key');
  });

  it('should handle errors when removing values', () => {
    const mockError = new Error('Remove error');
    Object.defineProperty(mockLocalStorage, 'removeItem', {
      value: jest.fn().mockImplementation(() => {
        throw mockError;
      })
    });

    localStorage.remove('key');
    expect(mockConsole.error).toHaveBeenCalledWith('LocalStorage remove error:', mockError);
  });

  it('should handle errors when clearing storage', () => {
    const mockError = new Error('Clear error');
    Object.defineProperty(mockLocalStorage, 'length', { value: 1 });
    Object.defineProperty(mockLocalStorage, 'key', {
      value: jest.fn().mockReturnValue('test_key')
    });
    Object.defineProperty(mockLocalStorage, 'removeItem', {
      value: jest.fn().mockImplementation(() => {
        throw mockError;
      })
    });

    localStorage.clear();
    expect(mockConsole.error).toHaveBeenCalledWith('LocalStorage clear error:', mockError);
  });
  it('should clear only prefixed values', () => {
    Object.defineProperty(mockLocalStorage, 'length', { value: 2 });
    mockLocalStorage.key.mockImplementation((index) => {
      const keys = ['test_key1', 'other_key'];
      return keys[index];
    });

    localStorage.clear();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key1');
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('other_key');
  });
});

describe('MemoryStorage', () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
  });

  it('should get and set values correctly', () => {
    const testData = { data: 'test' };
    memoryStorage.set('key', testData);
    expect(memoryStorage.get('key')).toEqual(testData);
  });

  it('should return undefined for non-existent keys', () => {
    expect(memoryStorage.get('nonexistent')).toBeUndefined();
  });

  it('should remove values correctly', () => {
    memoryStorage.set('key', 'value');
    memoryStorage.remove('key');
    expect(memoryStorage.get('key')).toBeUndefined();
  });

  it('should clear all values', () => {
    memoryStorage.set('key1', 'value1');
    memoryStorage.set('key2', 'value2');
    memoryStorage.clear();
    expect(memoryStorage.get('key1')).toBeUndefined();
    expect(memoryStorage.get('key2')).toBeUndefined();
  });
});

describe('createStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create LocalStorage instance by default', () => {
    const storage = createStorage();
    expect(storage).toBeInstanceOf(LocalStorage);
  });

  it('should create LocalStorage instance with prefix', () => {
    const storage = createStorage('local', 'custom_');
    expect(storage).toBeInstanceOf(LocalStorage);
    storage.set('test', { value: 123 });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom_test', JSON.stringify({ value: 123 }));
  });

  it('should create MemoryStorage instance when specified', () => {
    const storage = createStorage('memory');
    expect(storage).toBeInstanceOf(MemoryStorage);
  });

  it('should fallback to MemoryStorage when localStorage is not available', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockReturnValue(undefined as unknown as Window & typeof globalThis);
    const storage = createStorage('local');
    expect(storage).toBeInstanceOf(MemoryStorage);
    windowSpy.mockRestore();
  });

  it('should fallback to MemoryStorage when localStorage throws error', () => {
    const localStorageSpy = jest.spyOn(global, 'localStorage', 'get');
    localStorageSpy.mockReturnValue(undefined as unknown as Storage);
    const storage = createStorage('local');
    expect(storage).toBeInstanceOf(MemoryStorage);
    localStorageSpy.mockRestore();
  });
});
