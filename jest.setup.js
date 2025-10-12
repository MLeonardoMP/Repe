// jest.setup.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock UUID module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// In-memory storage for testing
global.testStorage = {
  users: [],
  workouts: [],
  exerciseTemplates: [],
};

// Mock file system operations for testing
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn((filePath) => {
      if (filePath.includes('users.json')) {
        return Promise.resolve(JSON.stringify(global.testStorage.users));
      } else if (filePath.includes('workouts.json')) {
        return Promise.resolve(JSON.stringify(global.testStorage.workouts));
      } else if (filePath.includes('exercise-templates.json')) {
        return Promise.resolve(JSON.stringify(global.testStorage.exerciseTemplates));
      }
      return Promise.reject(new Error('File not found'));
    }),
    writeFile: jest.fn((filePath, data) => {
      const jsonData = JSON.parse(data);
      if (filePath.includes('users.json')) {
        global.testStorage.users = jsonData;
      } else if (filePath.includes('workouts.json')) {
        global.testStorage.workouts = jsonData;
      } else if (filePath.includes('exercise-templates.json')) {
        global.testStorage.exerciseTemplates = jsonData;
      }
      return Promise.resolve();
    }),
    mkdir: jest.fn(() => Promise.resolve()),
    access: jest.fn(() => Promise.resolve()),
    rename: jest.fn(() => Promise.resolve()),
    unlink: jest.fn(() => Promise.resolve()),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Web API polyfills for Next.js API routes
import { TextEncoder, TextDecoder } from 'util';

// Polyfill basic globals needed for Next.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});