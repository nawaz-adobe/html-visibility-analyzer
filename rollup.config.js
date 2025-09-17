import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // ESM build for Node.js
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs()
    ],
    external: ['cheerio']
  },
  
  // CommonJS build for Node.js
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs()
    ],
    external: ['cheerio']
  },
  
  // Browser build (no cheerio dependency)
  {
    input: 'src/browser.js',
    output: {
      file: 'dist/browser.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve({
        browser: true
      }),
      commonjs()
    ]
  },
  
  // Minified browser build
  {
    input: 'src/browser.js',
    output: {
      file: 'dist/browser.min.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve({
        browser: true
      }),
      commonjs(),
      terser()
    ]
  }
];

