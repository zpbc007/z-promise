const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: 'src/'}),
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: [
    ".",
    "src",
    "node_modules"
  ]
};