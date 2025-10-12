/**
 * Storage Error Classes
 * Comprehensive error handling for the JSON storage system
 */

// ========== Base Storage Error ==========

export class StorageError extends Error {
  public code: string;
  
  constructor(
    message: string, 
    code: string, 
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    
    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  /**
   * Creates a JSON representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

// ========== Validation Errors ==========

export class ValidationError extends StorageError {
  constructor(
    message: string, 
    public readonly field?: string,
    public readonly value?: unknown,
    cause?: Error
  ) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    };
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(
    message: string,
    public readonly schema: string,
    public readonly violations: string[],
    field?: string,
    value?: unknown,
    cause?: Error
  ) {
    super(message, field, value, cause);
    this.name = 'SchemaValidationError';
    this.code = 'SCHEMA_VALIDATION_ERROR';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchemaValidationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      schema: this.schema,
      violations: this.violations,
    };
  }
}

export class DataIntegrityError extends ValidationError {
  constructor(
    message: string,
    public readonly entityType: string,
    public readonly entityId?: string,
    public readonly constraint?: string,
    cause?: Error
  ) {
    super(message, undefined, undefined, cause);
    this.name = 'DataIntegrityError';
    this.code = 'DATA_INTEGRITY_ERROR';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataIntegrityError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      entityId: this.entityId,
      constraint: this.constraint,
    };
  }
}

// ========== File Operation Errors ==========

export class FileOperationError extends StorageError {
  constructor(
    message: string, 
    public readonly operation: 'read' | 'write' | 'delete' | 'create' | 'move' | 'copy',
    public readonly filePath: string,
    public readonly systemError?: NodeJS.ErrnoException,
    cause?: Error
  ) {
    super(message, 'FILE_OPERATION_ERROR', cause);
    this.name = 'FileOperationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileOperationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      operation: this.operation,
      filePath: this.filePath,
      systemError: this.systemError ? {
        code: this.systemError.code,
        errno: this.systemError.errno,
        syscall: this.systemError.syscall,
        path: this.systemError.path,
      } : undefined,
    };
  }
}

export class FileNotFoundError extends FileOperationError {
  constructor(filePath: string, operation: FileOperationError['operation'] = 'read') {
    super(
      `File not found: ${filePath}`,
      operation,
      filePath
    );
    this.name = 'FileNotFoundError';
    this.code = 'FILE_NOT_FOUND';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileNotFoundError);
    }
  }
}

export class FilePermissionError extends FileOperationError {
  constructor(
    filePath: string, 
    operation: FileOperationError['operation'],
    requiredPermission: 'read' | 'write' | 'execute'
  ) {
    super(
      `Permission denied: Cannot ${operation} ${filePath} (requires ${requiredPermission} permission)`,
      operation,
      filePath
    );
    this.name = 'FilePermissionError';
    this.code = 'FILE_PERMISSION_ERROR';
    this.requiredPermission = requiredPermission;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilePermissionError);
    }
  }

  public readonly requiredPermission: 'read' | 'write' | 'execute';

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
    };
  }
}

export class FileCorruptedError extends FileOperationError {
  constructor(
    filePath: string, 
    public readonly reason: string,
    cause?: Error
  ) {
    super(
      `File corrupted: ${filePath} - ${reason}`,
      'read',
      filePath,
      undefined,
      cause
    );
    this.name = 'FileCorruptedError';
    this.code = 'FILE_CORRUPTED';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileCorruptedError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      reason: this.reason,
    };
  }
}

export class AtomicWriteError extends FileOperationError {
  constructor(
    filePath: string,
    public readonly tempFilePath: string,
    public readonly phase: 'write' | 'rename' | 'cleanup',
    cause?: Error
  ) {
    super(
      `Atomic write failed at ${phase} phase: ${filePath}`,
      'write',
      filePath,
      undefined,
      cause
    );
    this.name = 'AtomicWriteError';
    this.code = 'ATOMIC_WRITE_ERROR';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AtomicWriteError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      tempFilePath: this.tempFilePath,
      phase: this.phase,
    };
  }
}

// ========== Entity-Specific Errors ==========

export class EntityNotFoundError extends StorageError {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string
  ) {
    super(
      `${entityType} with ID '${entityId}' not found`,
      'ENTITY_NOT_FOUND'
    );
    this.name = 'EntityNotFoundError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EntityNotFoundError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      entityId: this.entityId,
    };
  }
}

export class DuplicateEntityError extends StorageError {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly conflictField?: string
  ) {
    const fieldMsg = conflictField ? ` (conflict on field: ${conflictField})` : '';
    super(
      `${entityType} with ID '${entityId}' already exists${fieldMsg}`,
      'DUPLICATE_ENTITY'
    );
    this.name = 'DuplicateEntityError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateEntityError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      entityId: this.entityId,
      conflictField: this.conflictField,
    };
  }
}

export class ConcurrentModificationError extends StorageError {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly expectedVersion?: string,
    public readonly actualVersion?: string
  ) {
    super(
      `Concurrent modification detected for ${entityType} '${entityId}'`,
      'CONCURRENT_MODIFICATION'
    );
    this.name = 'ConcurrentModificationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConcurrentModificationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      entityId: this.entityId,
      expectedVersion: this.expectedVersion,
      actualVersion: this.actualVersion,
    };
  }
}

// ========== Configuration and System Errors ==========

export class StorageConfigurationError extends StorageError {
  constructor(
    message: string,
    public readonly setting: string,
    public readonly value?: unknown,
    cause?: Error
  ) {
    super(message, 'STORAGE_CONFIGURATION_ERROR', cause);
    this.name = 'StorageConfigurationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageConfigurationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      setting: this.setting,
      value: this.value,
    };
  }
}

export class StorageCapacityError extends StorageError {
  constructor(
    message: string,
    public readonly currentSize: number,
    public readonly maxSize: number,
    public readonly filePath?: string
  ) {
    super(message, 'STORAGE_CAPACITY_ERROR');
    this.name = 'StorageCapacityError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageCapacityError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      filePath: this.filePath,
    };
  }
}

// ========== Business Logic Errors ==========

export class WorkoutValidationError extends ValidationError {
  constructor(
    message: string,
    public readonly workoutId: string,
    public readonly violation: 'timing' | 'exercises' | 'sets' | 'integrity',
    field?: string,
    value?: unknown,
    cause?: Error
  ) {
    super(message, field, value, cause);
    this.name = 'WorkoutValidationError';
    this.code = 'WORKOUT_VALIDATION_ERROR';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WorkoutValidationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      workoutId: this.workoutId,
      violation: this.violation,
    };
  }
}

export class ExerciseValidationError extends ValidationError {
  constructor(
    message: string,
    public readonly exerciseId: string,
    public readonly violation: 'sets' | 'order' | 'template' | 'metrics',
    field?: string,
    value?: unknown,
    cause?: Error
  ) {
    super(message, field, value, cause);
    this.name = 'ExerciseValidationError';
    this.code = 'EXERCISE_VALIDATION_ERROR';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExerciseValidationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      exerciseId: this.exerciseId,
      violation: this.violation,
    };
  }
}

// ========== Error Factory Functions ==========

/**
 * Creates appropriate storage error based on Node.js system error
 */
export function createStorageErrorFromSystemError(
  systemError: NodeJS.ErrnoException,
  operation: FileOperationError['operation'],
  filePath: string
): StorageError {
  switch (systemError.code) {
    case 'ENOENT':
      return new FileNotFoundError(filePath, operation);
    
    case 'EACCES':
    case 'EPERM':
      const permission = operation === 'read' ? 'read' : 'write';
      return new FilePermissionError(filePath, operation, permission);
    
    case 'ENOSPC':
      return new StorageCapacityError(
        'No space left on device',
        0, // current size unknown
        0, // max size unknown
        filePath
      );
    
    case 'EMFILE':
    case 'ENFILE':
      return new StorageConfigurationError(
        'Too many open files',
        'maxOpenFiles',
        undefined,
        systemError
      );
    
    default:
      return new FileOperationError(
        `File operation failed: ${systemError.message}`,
        operation,
        filePath,
        systemError
      );
  }
}

/**
 * Checks if an error is a recoverable storage error
 */
export function isRecoverableStorageError(error: Error): boolean {
  if (!(error instanceof StorageError)) {
    return false;
  }

  const recoverableCodes = [
    'FILE_NOT_FOUND',
    'ENTITY_NOT_FOUND',
    'VALIDATION_ERROR',
    'SCHEMA_VALIDATION_ERROR',
  ];

  return recoverableCodes.includes(error.code);
}

/**
 * Checks if an error indicates a system-level problem requiring attention
 */
export function isCriticalStorageError(error: Error): boolean {
  if (!(error instanceof StorageError)) {
    return false;
  }

  const criticalCodes = [
    'FILE_PERMISSION_ERROR',
    'FILE_CORRUPTED',
    'STORAGE_CAPACITY_ERROR',
    'STORAGE_CONFIGURATION_ERROR',
    'ATOMIC_WRITE_ERROR',
  ];

  return criticalCodes.includes(error.code);
}

// ========== Error Utilities ==========

/**
 * Aggregates multiple storage errors into a single summary error
 */
export class AggregatedStorageError extends StorageError {
  constructor(
    message: string,
    public readonly errors: StorageError[]
  ) {
    super(message, 'AGGREGATED_ERROR');
    this.name = 'AggregatedStorageError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AggregatedStorageError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors.map(error => error.toJSON()),
      errorCount: this.errors.length,
    };
  }
}

/**
 * Creates an aggregated error from multiple storage errors
 */
export function aggregateStorageErrors(
  errors: StorageError[],
  operation: string
): AggregatedStorageError {
  const message = `Multiple errors occurred during ${operation}: ${errors.length} error(s)`;
  return new AggregatedStorageError(message, errors);
}