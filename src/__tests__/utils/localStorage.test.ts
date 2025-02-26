import { LocalStorage } from '../../utils/storage';

describe('LocalStorage', () => {
  const prefix = 'test_';
  const storage = new LocalStorage(prefix);
  const testKey = 'test_key';
  const testValue = { data: 'test_value' };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should set item to localStorage with prefix', () => {
    storage.set(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `${prefix}${testKey}`,
      JSON.stringify(testValue)
    );
  });

  it('should get item from localStorage with prefix', () => {
    storage.set(testKey, testValue);
    const result = storage.get(testKey);
    expect(result).toEqual(testValue);
    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}${testKey}`);
  });

  it('should return null when getting non-existent item', () => {
    const result = storage.get('non_existent_key');
    expect(result).toBeNull();
  });

  it('should remove item from localStorage with prefix', () => {
    storage.remove(testKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(`${prefix}${testKey}`);
  });

  it('should clear all prefixed items from localStorage', () => {
    const prefixedKey = `${prefix}${testKey}`;
    const nonPrefixedKey = 'other_key';
    
    storage.set(testKey, testValue);
    localStorage.setItem(nonPrefixedKey, JSON.stringify(testValue));

    storage.clear();

    expect(localStorage.removeItem).toHaveBeenCalledWith(prefixedKey);
    expect(localStorage.removeItem).not.toHaveBeenCalledWith(nonPrefixedKey);
  });

  it('should handle JSON parse error when getting item', () => {
    localStorage.setItem(`${prefix}${testKey}`, 'invalid json');
    const result = storage.get(testKey);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when setting item', () => {
    const error = new Error('Storage full');
    localStorage.setItem.mockImplementation(() => {
      throw error;
    });

    storage.set(testKey, testValue);
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when removing item', () => {
    const error = new Error('Remove error');
    localStorage.removeItem.mockImplementation(() => {
      throw error;
    });

    storage.remove(testKey);
    expect(console.error).toHaveBeenCalled();
  });
});