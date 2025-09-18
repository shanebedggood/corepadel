module.exports = {
  // Coverage collection settings
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/environments/**',
    '!src/test-utils.ts',
    '!src/setup-jest.ts',
    '!src/**/*.module.ts', // Exclude module files
    '!src/**/*.routing.ts', // Exclude routing files
  ],

  // Coverage thresholds by file type
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Critical services - higher thresholds
    'src/app/services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Guards and interceptors - high thresholds
    'src/app/guards/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    'src/app/interceptors/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Components - moderate thresholds (can be increased over time)
    'src/app/components/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/app/pages/': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary',
    'clover',
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Watermarks for coverage reports
  coverageReporters: [
    ['text', { skipFull: true }],
    ['text-summary'],
    ['html', { subdir: 'html' }],
    ['lcov', { subdir: 'lcov' }],
    ['json', { subdir: 'json' }],
    ['json-summary', { subdir: 'json-summary' }],
  ],
};
