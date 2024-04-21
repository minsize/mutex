import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: "node",
  verbose: true,
  roots: [
    "./__tests__"
  ]
};

export default config;