// Jest setup for database tests
// This file is loaded before any database tests run

process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgresql://localhost:5432/repe_test';

// Increase timeout for database operations
jest.setTimeout(15000);

// Global test utilities
global.testDb = null;
