// jest.setup.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock uuid module to avoid ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Mock fetch globally with a rejected Promise so tests can override per-case
global.fetch = jest.fn(() => Promise.reject(new Error('global.fetch is not mocked')));

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