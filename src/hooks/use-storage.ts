import { useState, useCallback, useEffect } from 'react';

export interface UseStorageReturn<T> {
  data?: T;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  read: (id: string) => Promise<T | undefined>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
  list: () => Promise<T[]>;
  exists: (id: string) => Promise<boolean>;
  clear: () => Promise<void>;
  backup: () => Promise<string>;
  restore: (backup: string) => Promise<void>;
}

export function useStorage<T extends { id: string }>(collection: string): UseStorageReturn<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Get localStorage key for this collection
  const getStorageKey = useCallback(() => `repe_${collection}`, [collection]);

  // Read all items from localStorage
  const readFromStorage = useCallback((): T[] => {
    if (typeof window === 'undefined') return [];
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      return [];
    }
  }, [getStorageKey]);

  // Write all items to localStorage
  const writeToStorage = useCallback((items: T[]): void => {
    if (typeof window === 'undefined') return;
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.error('Error writing to localStorage:', err);
      throw new Error('Failed to save to storage');
    }
  }, [getStorageKey]);

  const create = useCallback(async (itemData: Omit<T, 'id'>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = readFromStorage();
      
      // Create with ID and timestamps
      const newItem = {
        ...itemData,
        id: `${collection}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as T;
      
      items.push(newItem);
      writeToStorage(items);
      setData(newItem);
      
      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Create failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collection, readFromStorage, writeToStorage]);

  const read = useCallback(async (id: string): Promise<T | undefined> => {
    setIsValidating(true);
    setError(null);
    try {
      const items = readFromStorage();
      return items.find(item => item.id === id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Read failed');
      setError(error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [readFromStorage]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = readFromStorage();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error('Item not found');
      }
      
      const updatedItem = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      } as T;
      
      items[index] = updatedItem;
      writeToStorage(items);
      setData(updatedItem);
      
      return updatedItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [readFromStorage, writeToStorage]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = readFromStorage();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return false;
      }
      
      items.splice(index, 1);
      writeToStorage(items);
      
      if (data?.id === id) {
        setData(undefined);
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [data?.id, readFromStorage, writeToStorage]);

  const list = useCallback(async (): Promise<T[]> => {
    setIsValidating(true);
    setError(null);
    try {
      return readFromStorage();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('List failed');
      setError(error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [readFromStorage]);

  const exists = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const items = readFromStorage();
      return items.some(item => item.id === id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Exists check failed');
      setError(error);
      throw error;
    }
  }, [readFromStorage]);

  const clear = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      writeToStorage([]);
      setData(undefined);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Clear failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [writeToStorage]);

  const backup = useCallback(async (): Promise<string> => {
    setError(null);
    try {
      const items = readFromStorage();
      return JSON.stringify(items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Backup failed');
      setError(error);
      throw error;
    }
  }, [readFromStorage]);

  const restore = useCallback(async (backup: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = JSON.parse(backup) as T[];
      writeToStorage(items);
      setData(items[0]); // Set first item as current data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Restore failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [writeToStorage]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    create,
    read,
    update,
    delete: deleteItem,
    list,
    exists,
    clear,
    backup,
    restore,
  };
}