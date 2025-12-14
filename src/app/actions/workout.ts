"use server";

import { revalidatePath } from "next/cache";
import { listWorkouts, getWorkout, upsertWorkout, deleteWorkout } from "@/lib/db/repos/workout";
import type { UpsertWorkoutPayload } from "@/lib/db/repos/workout";
import { addSet, updateSet, deleteSet } from "@/lib/db/repos/set";

export async function listWorkoutsAction(params?: { limit?: number; offset?: number }) {
  return listWorkouts({ limit: params?.limit, offset: params?.offset });
}

export async function getWorkoutAction(id: string) {
  return getWorkout(id);
}

export async function upsertWorkoutAction(payload: UpsertWorkoutPayload) {
  const workout = await upsertWorkout(payload);
  revalidatePath("/history");
  return workout;
}

export async function deleteWorkoutAction(id: string) {
  await deleteWorkout(id);
  revalidatePath("/history");
}

export async function addSetAction(workoutExerciseId: string, input: Parameters<typeof addSet>[0]) {
  const set = await addSet({ ...input, workoutExerciseId });
  revalidatePath("/history");
  return set;
}

export async function updateSetAction(id: string, patch: Parameters<typeof updateSet>[1]) {
  const set = await updateSet(id, patch);
  revalidatePath("/history");
  return set;
}

export async function deleteSetAction(id: string) {
  await deleteSet(id);
  revalidatePath("/history");
}
