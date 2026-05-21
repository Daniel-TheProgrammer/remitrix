/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/pages'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.scss$': '<rootDir>/src/__mocks__/styleMock.ts',
    '\\.scss$': '<rootDir>/src/__mocks__/styleMock.ts'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'pages/api/**/*.ts',
    '!**/__tests__/**',
    '!**/*.d.ts'
  ]
};
