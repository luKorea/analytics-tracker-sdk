import { MemoryStorage } from '../../utils/storage';

describe('MemoryStorage', () => {
  const storage = new MemoryStorage();
  const testKey = 'test_key';
  const testValue = { data: 'test_value' };

  beforeEach(() => {
    storage.clear();
  });

  it('should set and get item from memory', () => {
    storage.set(testKey, testValue);
    const result = storage.get(testKey);
    expect(result).toEqual(testValue);
  });

  it('should return undefined when getting non-existent item', () => {
    const result = storage.get('non_existent_key');
    expect(result).toBeUndefined();
  });

  it('should remove item from memory', () => {
    storage.set(testKey, testValue);
    storage.remove(testKey);
    const result = storage.get(testKey);
    expect(result).toBeUndefined();
  });

  it('should clear all items from memory', () => {
    storage.set(testKey, testValue);
    storage.set('another_key', 'another_value');
    
    storage.clear();
    
    expect(storage.get(testKey)).toBeUndefined();
    expect(storage.get('another_key')).toBeUndefined();
  });
});