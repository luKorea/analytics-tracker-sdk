import { Storage } from '../../utils/storage';

describe('Storage', () => {
  const storage = new Storage();
  const testKey = 'test_key';
  const testValue = { data: 'test_value' };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should set item to localStorage', () => {
    storage.set(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));
  });

  it('should get item from localStorage', () => {
    const mockValue = JSON.stringify(testValue);
    jest.spyOn(localStorage, 'getItem').mockReturnValue(mockValue);

    const result = storage.get(testKey);
    expect(result).toEqual(testValue);
    expect(localStorage.getItem).toHaveBeenCalledWith(testKey);
  });

  it('should return null when getting non-existent item', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);

    const result = storage.get('non_existent_key');
    expect(result).toBeNull();
  });

  it('should remove item from localStorage', () => {
    storage.remove(testKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(testKey);
  });

  it('should clear all items from localStorage', () => {
    storage.clear();
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('should handle JSON parse error when getting item', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue('invalid json');
    jest.spyOn(console, 'error').mockImplementation(jest.fn());

    const result = storage.get(testKey);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
