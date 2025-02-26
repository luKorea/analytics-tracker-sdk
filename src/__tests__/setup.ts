// 设置全局测试环境
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '{}',
})) as any;

// 设置全局测试环境
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '{}',
})) as any;

const store: { [key: string]: string } = {};

type MockStorage = {
  store: { [key: string]: string };
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
  length: number;
  key: jest.Mock<string | null, [number]>;
};

const mockLocalStorage: MockStorage = {
  store,
  getItem: jest.fn().mockImplementation((key: string) => store[key] || null),
  setItem: jest.fn().mockImplementation((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: jest.fn().mockImplementation((key: string) => {
    delete store[key];
  }),
  clear: jest.fn().mockImplementation(() => {
    Object.keys(store).forEach(key => delete store[key]);
  }),
  length: 0,
  key: jest.fn().mockImplementation((index: number) => Object.keys(store)[index] || null)
}

const localStorageMock = new LocalStorageMock();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// 设置全局 localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage
});

// 每个测试前重置 mock 状态
beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
});

// 为 console.error 添加 spy
console.error = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.store = {};
  console.error = jest.fn();
});

// 模拟 performance API
Object.defineProperty(window, 'performance', {
  value: {
    timing: {
      navigationStart: 1,
      loadEventEnd: 100,
    },
    getEntriesByType: () => {
      return [];
    },
    getEntries: () => {
      return [];
    },
    getEntriesByName: () => {
      return [];
    }
  },
});



// 模拟 performance API
Object.defineProperty(window, 'performance', {
  value: {
    timing: {
      navigationStart: 1,
      loadEventEnd: 100,
    },
    getEntriesByType: () => {
      return [];
    },
    getEntries: () => {
      return [];
    },
    getEntriesByName: () => {
      return [];
    }
  },
});

// 清理所有模拟
beforeEach(() => {
  jest.clearAllMocks();
});
import '@testing-library/jest-dom';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock console methods
jest.spyOn(console, 'error').mockImplementation(() => {
  return undefined;
});
jest.spyOn(console, 'warn').mockImplementation(() => {
  return undefined;
});
