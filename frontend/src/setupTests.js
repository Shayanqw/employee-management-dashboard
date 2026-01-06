/**
 * Jest setup for Create React App.
 *
 * NOTE: Axios v1 ships an ESM entrypoint that can trip CRA/Jest (node_modules
 * aren't transformed by default). To keep tests stable without ejecting,
 * we mock axios here.
 */

import "@testing-library/jest-dom";

// eslint-disable-next-line no-undef
jest.mock("axios", () => {
  const mockHttp = {
    get: jest.fn(() => Promise.resolve({ data: { status: "ok" } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  return {
    create: jest.fn(() => mockHttp),
  };
});
