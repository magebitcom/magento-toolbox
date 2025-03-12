import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: ['dist/test/setup.js', 'dist/test/**/*.test.js'],
});
