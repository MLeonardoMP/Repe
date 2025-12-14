import { getDb } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type UserSettings = typeof userSettings.$inferSelect;

// Validate user settings with Zod
const UserSettingsSchema = z.object({
  units: z.enum(["metric" as const, "imperial" as const]).default("metric"),
  preferencesJson: z.record(z.string(), z.unknown()).default({}),
});

export interface UserSettingsInput {
  units?: "metric" | "imperial";
  preferencesJson?: Record<string, unknown>;
  userId?: string;
}

/**
 * Get user preferences
 */
export async function getPreferences(
  userId?: string
): Promise<UserSettings | null> {
  try {
    const baseQuery = getDb().select().from(userSettings);
    let query = baseQuery;

    if (userId) {
      query = query.where(eq(userSettings.userId, userId));
    }

    const result = await query.limit(1);
    return result[0] || null;
  } catch (error) {
    throw StorageError.internal(
      "Failed to get preferences",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Save user preferences
 */
export async function savePreferences(
  input: UserSettingsInput
): Promise<UserSettings> {
  try {
    // Validate input
    const validated = UserSettingsSchema.parse({
      units: input.units || "metric",
      preferencesJson: input.preferencesJson || {},
    });

    // Check if preferences exist
    const baseQuery = getDb().select().from(userSettings);
    let query = baseQuery;
    if (input.userId) {
      query = query.where(eq(userSettings.userId, input.userId));
    }

    const existing = await query.limit(1);

    let result;
    if (existing[0]) {
      // Update existing
      result = await getDb()
        .update(userSettings)
        .set({
          units: validated.units,
          preferencesJson: validated.preferencesJson,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.id, existing[0].id))
        .returning();
    } else {
      // Create new
      result = await getDb()
        .insert(userSettings)
        .values({
          units: validated.units,
          preferencesJson: validated.preferencesJson,
          userId: input.userId,
        })
        .returning();
    }

    if (!result[0]) {
      throw new Error("Failed to save preferences");
    }

    return result[0];
  } catch (error) {
    if (error instanceof StorageError) throw error;
    if (error instanceof z.ZodError) {
      throw StorageError.validation("Invalid preferences: " + error.message);
    }
    throw StorageError.internal(
      "Failed to save preferences",
      error instanceof Error ? error.message : String(error)
    );
  }
}
