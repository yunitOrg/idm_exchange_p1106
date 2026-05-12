module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.spec.js'
  ],
  verbose: true,
  testURL: 'http://localhost/',
  globals: {
    'window.IDM': {
      http: {
        post: jest.fn()
      }
    }
  }
};
