import { useState, useCallback } from 'react';

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

  const create = useCallback(async (itemData: Omit<T, 'id'>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      // Create with ID and timestamps
      const newItem = {
        ...itemData,
        id: `${collection}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as T;
      
      // In a real implementation, this would save to storage
      setData(newItem);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Create failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  const read = useCallback(async (id: string): Promise<T | undefined> => {
    setIsValidating(true);
    setError(null);
    try {
      // In a real implementation, this would read from storage
      return data?.id === id ? data : undefined;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Read failed'));
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, [data]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      if (data?.id === id) {
        const updatedItem = {
          ...data,
          ...updates,
          updatedAt: new Date().toISOString(),
        } as T;
        setData(updatedItem);
        return updatedItem;
      }
      throw new Error('Item not found');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (data?.id === id) {
        setData(undefined);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const list = useCallback(async (): Promise<T[]> => {
    setIsValidating(true);
    setError(null);
    try {
      // In a real implementation, this would list from storage
      return data ? [data] : [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error('List failed'));
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, [data]);

  const exists = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      return data?.id === id || false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Exists check failed'));
      throw err;
    }
  }, [data]);

  const clear = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setData(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Clear failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const backup = useCallback(async (): Promise<string> => {
    setError(null);
    try {
      return data ? JSON.stringify(data) : '{}';
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Backup failed'));
      throw err;
    }
  }, [data]);

  const restore = useCallback(async (backup: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const restoredData = JSON.parse(backup) as T;
      setData(restoredData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Restore failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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