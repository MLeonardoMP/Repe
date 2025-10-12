/**
 * User types for workout tracking application
 * Based on data model specification
 */

export interface User {
  id: string;              // Unique identifier
  name?: string;           // Optional display name
  preferences: UserPreferences;
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}

export interface UserPreferences {
  defaultWeightUnit: 'kg' | 'lbs';
  defaultIntensityScale: 1 | 5 | 10;  // 1-1, 1-5, or 1-10 scale
  theme: 'dark';           // Only dark theme for v1
}

// Default user preferences for new users
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultWeightUnit: 'kg',
  defaultIntensityScale: 5,
  theme: 'dark',
};

// Type guards for runtime validation
export function isValidWeightUnit(unit: string): unit is 'kg' | 'lbs' {
  return unit === 'kg' || unit === 'lbs';
}

export function isValidIntensityScale(scale: number): scale is 1 | 5 | 10 {
  return scale === 1 || scale === 5 || scale === 10;
}

// User creation type (without auto-generated fields)
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// User update type (partial data)
export type UpdateUserData = Partial<Pick<User, 'name'>> & {
  preferences?: Partial<UserPreferences>;
};