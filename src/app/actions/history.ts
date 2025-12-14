"use server";

import { revalidatePath } from "next/cache";
import { listHistory, logSession } from "@/lib/db/repos/history";
import type { ListHistoryParams, NewHistoryEntry } from "@/lib/db/repos/history";

export async function listHistoryAction(params?: ListHistoryParams) {
  return listHistory(params || {});
}

export async function logSessionAction(entry: NewHistoryEntry) {
  const result = await logSession(entry);
  revalidatePath("/history");
  return result;
}
