/// <reference types="jest" />

declare global {
  var beforeEach: jest.Lifecycle;
  var afterEach: jest.Lifecycle;
  var beforeAll: jest.Lifecycle;
  var afterAll: jest.Lifecycle;
  var describe: jest.Describe;
  var it: jest.It;
  var test: jest.It;
  var expect: jest.Expect;
  var jest: Jest;
  
  var testStorage: {
    users: any[];
    workouts: any[];
    exerciseTemplates: any[];
  };
}

export {};