/**
 * Custom error class for storage operations (both JSON and DB)
 * Used consistently across repositories and services
 */
export class StorageError extends Error {
  constructor(
    public type: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL',
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }

  static validation(message: string, cause?: unknown): StorageError {
    return new StorageError('VALIDATION', message, cause);
  }

  static notFound(message: string, cause?: unknown): StorageError {
    return new StorageError('NOT_FOUND', message, cause);
  }

  static conflict(message: string, cause?: unknown): StorageError {
    return new StorageError('CONFLICT', message, cause);
  }

  static internal(message: string, cause?: unknown): StorageError {
    return new StorageError('INTERNAL', message, cause);
  }
}

/**
 * Helper to map StorageError to HTTP status codes
 */
export const errorToHttpStatus = (error: StorageError): number => {
  switch (error.type) {
    case 'VALIDATION':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'INTERNAL':
    default:
      return 500;
  }
};

/**
 * Helper to create error response
 */
export const createErrorResponse = (error: StorageError) => {
  return {
    error: {
      type: error.type,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && error.cause && {
        cause: error.cause instanceof Error ? error.cause.message : String(error.cause),
      }),
    },
  };
};
