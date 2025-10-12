/**
 * JSON Storage Service
 * Provides atomic file operations for workout data persistence
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { User, WorkoutSession, ExerciseTemplate } from '@/types';

// Storage paths
const DATA_DIR = process.env.NODE_ENV === 'test' 
  ? path.join(process.cwd(), 'tests', 'fixtures', 'data')
  : path.join(process.cwd(), 'data');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKOUTS_FILE = path.join(DATA_DIR, 'workouts.json');
const EXERCISE_TEMPLATES_FILE = path.join(DATA_DIR, 'exercise-templates.json');

// Zod schemas for validation
const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  preferences: z.object({
    defaultWeightUnit: z.enum(['kg', 'lbs']),
    defaultIntensityScale: z.union([z.literal(1), z.literal(5), z.literal(10)]),
    theme: z.literal('dark')
  }),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date string"
  }),
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date string"
  })
});

const WorkoutSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().optional(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val))),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
  exercises: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: z.enum(['strength', 'cardio', 'flexibility', 'other']),
    muscleGroups: z.array(z.string()),
    sets: z.array(z.object({
      id: z.string().min(1),
      type: z.enum(['working', 'warmup', 'dropset', 'failure', 'rest-pause']),
      reps: z.number().int().positive().optional(),
      weight: z.number().positive().optional(),
      duration: z.number().int().positive().optional(),
      distance: z.number().positive().optional(),
      intensity: z.number().int().min(1).max(10).optional(),
      notes: z.string().optional(),
      restTime: z.number().int().min(0).optional(),
      timestamp: z.string().refine((val) => !isNaN(Date.parse(val)))
    }))
  })),
  notes: z.string().optional(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val))),
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)))
});

const ExerciseTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  defaultWeightUnit: z.enum(['kg', 'lbs'])
});

// Extended types for storage (with timestamps)
type StorageExerciseTemplate = ExerciseTemplate & {
  createdAt: string;
  updatedAt: string;
};

const StorageExerciseTemplateSchema = ExerciseTemplateSchema.extend({
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val))),
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)))
});

// Storage error classes
export class StorageError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends StorageError {
  constructor(message: string, public field?: string, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export class FileOperationError extends StorageError {
  constructor(message: string, public operation: string, public filePath: string, cause?: Error) {
    super(message, 'FILE_OPERATION_ERROR', cause);
    this.name = 'FileOperationError';
  }
}

// Utility functions
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T[]> {
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Validate array of items
    if (!Array.isArray(data)) {
      throw new ValidationError(`Expected array in ${filePath}, got ${typeof data}`);
    }
    
    return data.map((item, index) => {
      try {
        return schema.parse(item);
      } catch (error) {
        throw new ValidationError(
          `Validation failed for item at index ${index} in ${filePath}`,
          undefined,
          error as Error
        );
      }
    });
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    
    // File doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    
    throw new FileOperationError(
      `Failed to read ${filePath}`,
      'read',
      filePath,
      error as Error
    );
  }
}

async function writeJsonFile<T>(filePath: string, data: T[], schema: z.ZodSchema<T>): Promise<void> {
  try {
    // Validate all items before writing
    const validatedData = data.map((item, index) => {
      try {
        return schema.parse(item);
      } catch (error) {
        throw new ValidationError(
          `Validation failed for item at index ${index}`,
          undefined,
          error as Error
        );
      }
    });
    
    await ensureDataDirectory();
    
    // Atomic write using temporary file
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    
    try {
      await fs.writeFile(tempPath, JSON.stringify(validatedData, null, 2), 'utf-8');
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    
    throw new FileOperationError(
      `Failed to write ${filePath}`,
      'write',
      filePath,
      error as Error
    );
  }
}

// Generic CRUD operations
async function findById<T extends { id: string }>(
  filePath: string,
  schema: z.ZodSchema<T>,
  id: string
): Promise<T | undefined> {
  const items = await readJsonFile(filePath, schema);
  return items.find(item => item.id === id);
}

async function create<T extends { id: string; createdAt: string; updatedAt: string }>(
  filePath: string,
  schema: z.ZodSchema<T>,
  item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  } as T;
  
  const items = await readJsonFile(filePath, schema);
  items.push(newItem);
  await writeJsonFile(filePath, items, schema);
  
  return newItem;
}

async function update<T extends { id: string; updatedAt: string }>(
  filePath: string,
  schema: z.ZodSchema<T>,
  id: string,
  updates: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<T | undefined> {
  const items = await readJsonFile(filePath, schema);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  } as T;
  
  items[index] = updatedItem;
  await writeJsonFile(filePath, items, schema);
  
  return updatedItem;
}

async function deleteById<T extends { id: string }>(
  filePath: string,
  schema: z.ZodSchema<T>,
  id: string
): Promise<boolean> {
  const items = await readJsonFile(filePath, schema);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  items.splice(index, 1);
  await writeJsonFile(filePath, items, schema);
  
  return true;
}

// User operations
export const userStorage = {
  async findAll(): Promise<User[]> {
    return readJsonFile(USERS_FILE, UserSchema);
  },
  
  async findById(id: string): Promise<User | undefined> {
    return findById(USERS_FILE, UserSchema, id);
  },
  
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return create(USERS_FILE, UserSchema, user);
  },
  
  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    return update(USERS_FILE, UserSchema, id, updates);
  },
  
  async delete(id: string): Promise<boolean> {
    return deleteById(USERS_FILE, UserSchema, id);
  }
};

// Workout operations
export const workoutStorage = {
  async findAll(): Promise<WorkoutSession[]> {
    return readJsonFile(WORKOUTS_FILE, WorkoutSessionSchema);
  },
  
  async findById(id: string): Promise<WorkoutSession | undefined> {
    return findById(WORKOUTS_FILE, WorkoutSessionSchema, id);
  },
  
  async findByUserId(userId: string): Promise<WorkoutSession[]> {
    const workouts = await this.findAll();
    return workouts.filter(workout => workout.userId === userId);
  },
  
  async create(workout: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutSession> {
    return create(WORKOUTS_FILE, WorkoutSessionSchema, workout);
  },
  
  async update(id: string, updates: Partial<Omit<WorkoutSession, 'id' | 'createdAt'>>): Promise<WorkoutSession | undefined> {
    return update(WORKOUTS_FILE, WorkoutSessionSchema, id, updates);
  },
  
  async delete(id: string): Promise<boolean> {
    return deleteById(WORKOUTS_FILE, WorkoutSessionSchema, id);
  }
};

// Exercise template operations  
export const exerciseTemplateStorage = {
  async findAll(): Promise<ExerciseTemplate[]> {
    try {
      await fs.access(EXERCISE_TEMPLATES_FILE);
      const content = await fs.readFile(EXERCISE_TEMPLATES_FILE, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new ValidationError(`Expected array in ${EXERCISE_TEMPLATES_FILE}, got ${typeof data}`);
      }
      
      return data.map((item, index) => {
        try {
          return StorageExerciseTemplateSchema.parse(item);
        } catch (error) {
          throw new ValidationError(
            `Validation failed for item at index ${index} in ${EXERCISE_TEMPLATES_FILE}`,
            undefined,
            error as Error
          );
        }
      }).map(({ createdAt, updatedAt, ...template }) => template);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      // File doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      
      throw new FileOperationError(
        `Failed to read ${EXERCISE_TEMPLATES_FILE}`,
        'read',
        EXERCISE_TEMPLATES_FILE,
        error as Error
      );
    }
  },
  
  async findById(id: string): Promise<ExerciseTemplate | undefined> {
    const templates = await readJsonFile(EXERCISE_TEMPLATES_FILE, StorageExerciseTemplateSchema);
    const template = templates.find(t => t.id === id);
    if (!template) return undefined;
    const { createdAt, updatedAt, ...publicTemplate } = template;
    return publicTemplate;
  },
  
  async findByCategory(category: string): Promise<ExerciseTemplate[]> {
    const templates = await this.findAll();
    return templates.filter(template => template.category === category);
  },
  
  async create(template: Omit<ExerciseTemplate, 'id'>): Promise<ExerciseTemplate> {
    const now = new Date().toISOString();
    const newTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const templates = await readJsonFile(EXERCISE_TEMPLATES_FILE, StorageExerciseTemplateSchema);
    templates.push(newTemplate);
    await writeJsonFile(EXERCISE_TEMPLATES_FILE, templates, StorageExerciseTemplateSchema);
    
    const { createdAt, updatedAt, ...publicTemplate } = newTemplate;
    return publicTemplate;
  },
  
  async update(id: string, updates: Partial<Omit<ExerciseTemplate, 'id'>>): Promise<ExerciseTemplate | undefined> {
    const templates = await readJsonFile(EXERCISE_TEMPLATES_FILE, StorageExerciseTemplateSchema);
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedTemplate = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    templates[index] = updatedTemplate;
    await writeJsonFile(EXERCISE_TEMPLATES_FILE, templates, StorageExerciseTemplateSchema);
    
    const { createdAt, updatedAt, ...publicTemplate } = updatedTemplate;
    return publicTemplate;
  },
  
  async delete(id: string): Promise<boolean> {
    const templates = await readJsonFile(EXERCISE_TEMPLATES_FILE, StorageExerciseTemplateSchema);
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }
    
    templates.splice(index, 1);
    await writeJsonFile(EXERCISE_TEMPLATES_FILE, templates, StorageExerciseTemplateSchema);
    
    return true;
  }
};

// Utility for clearing all data (useful for tests)
export async function clearAllData(): Promise<void> {
  try {
    await Promise.all([
      fs.unlink(USERS_FILE).catch(() => {}),
      fs.unlink(WORKOUTS_FILE).catch(() => {}),
      fs.unlink(EXERCISE_TEMPLATES_FILE).catch(() => {})
    ]);
  } catch (error) {
    throw new FileOperationError(
      'Failed to clear data files',
      'delete',
      DATA_DIR,
      error as Error
    );
  }
}

// Initialize data directory on module load
if (typeof window === 'undefined') {
  ensureDataDirectory().catch(console.error);
}