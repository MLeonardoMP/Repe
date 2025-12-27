import { act, renderHook, waitFor } from '@testing-library/react';
import { useWorkout, ACTIVE_WORKOUT_STORAGE_KEY, WorkoutTemplate } from '@/hooks/use-workout';
import type { WorkoutSession } from '@/types';

const mockTemplate: WorkoutTemplate = {
  name: 'Test Routine',
  exercises: [],
};

describe('useWorkout persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('persists the active workout to localStorage', async () => {
    const { result } = renderHook(() => useWorkout());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.startWorkout(mockTemplate);
    });

    const stored = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toMatchObject({ name: mockTemplate.name });
  });

  it('rehydrates an active workout from storage when mounting', async () => {
    const persistedWorkout: WorkoutSession = {
      id: 'stored-1',
      userId: 'user-1',
      name: 'Persisted Routine',
      exercises: [],
      startTime: new Date().toISOString(),
      status: 'active',
      durationSeconds: 0,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(persistedWorkout));

    const { result } = renderHook(() => useWorkout());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeWorkout).toEqual(
      expect.objectContaining({ name: persistedWorkout.name, status: 'active' })
    );
  });

  it('omits non-UUID workoutId when finishing to avoid API validation errors', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'server-uuid' }) });
    // @ts-expect-error override for test environment
    global.fetch = fetchSpy;

    const { result } = renderHook(() => useWorkout());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setActiveWorkout?.({
        id: 'non-uuid-id',
        userId: 'user-1',
        name: 'Persisted Routine',
        exercises: [],
        startTime: new Date().toISOString(),
        status: 'active',
        durationSeconds: 0,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await act(async () => {
      await result.current.finishWorkout();
    });

    // First call persists workout, second logs history
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const historyCall = fetchSpy.mock.calls[1];
    const body = JSON.parse((historyCall[1]!.body as string) || '{}');
    expect(body.workoutId).toBe('server-uuid');
  });
});