// jest.config.mjs
import nextJest from 'next/jest.js'
const createJestConfig = nextJest({
  dir: './',
})
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
}
export default createJestConfig(config)
