module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/**/*.spec.js'
    ],
    coverageDirectory: 'coverage',
    moduleNameMapper: {
        '^webextension-polyfill$': '<rootDir>/src/__mocks__/webextension-polyfill.js',
    }
};