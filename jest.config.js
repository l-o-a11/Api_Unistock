module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/application/use-cases/auth/**/*.js",
    "src/application/use-cases/users/**/*.js",
    "src/application/use-cases/production/**/*.js",
    "src/application/use-cases/roles/**/*.js",
    "src/interfaces/middlewares/authMiddleware.js"
  ],
  coverageDirectory: "coverage",
  verbose: true
};
