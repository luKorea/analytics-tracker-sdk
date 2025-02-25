// 设置全局测试环境
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '{}',
})) as any;

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 模拟 performance API
Object.defineProperty(window, 'performance', {
  value: {
    timing: {
      navigationStart: 1,
      loadEventEnd: 100,
    },
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
});

// 清理所有模拟
beforeEach(() => {
  jest.clearAllMocks();
});
