const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] test build started');
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] test build finished');
    });
  },
};

/**
 * @type {import('esbuild').Plugin}
 */
const copyAssetsPlugin = {
  name: 'copy-assets',
  setup(build) {
    build.onEnd(() => {
      const copyDir = (src, dest) => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      copyDir('test-resources', 'dist/test-resources');
    });
  },
};

async function main() {
  // Test build context
  const testCtx = await esbuild.context({
    entryPoints: ['src/test/**/*.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: true,
    sourcesContent: !production,
    platform: 'node',
    outdir: 'dist/test',
    define: {
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    },
    external: ['vscode', 'mocha'],
    logLevel: 'info',
    plugins: [esbuildProblemMatcherPlugin, copyAssetsPlugin],
  });

  if (watch) {
    await testCtx.watch();
  } else {
    await testCtx.rebuild();
    await testCtx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
