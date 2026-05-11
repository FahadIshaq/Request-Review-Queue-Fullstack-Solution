/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/domain/**/*.ts",
    "src/services/**/*.ts",
    "src/repository/**/*.ts",
    "src/http/**/*.ts",
  ],
  verbose: true,
};
