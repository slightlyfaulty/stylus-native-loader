<p align="center">
  <a href="https://stylus-lang.com/"><img src="https://stylus-lang.com/logo.svg" alt="Stylus" title="Stylus" height="120" valign="middle"></a>
  <a href="https://webpack.js.org/"><img src="https://webpack.js.org/assets/icon-square-big.svg" alt="Webpack" title="Webpack" height="120" valign="middle"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/v/stylus-native-loader" alt="Version"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/stylus-native-loader" alt="Node.js Version"></a>
  <a href="https://packagephobia.com/result?p=stylus-native-loader"><img src="https://packagephobia.com/badge?p=stylus-native-loader" alt="Size"></a>
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/dm/stylus-native-loader" alt="Downloads"></a>
  <a href="https://github.com/slightlyfaulty/stylus-native-loader/issues?q="><img src="https://img.shields.io/maintenance/yes/2024" alt="Maintained"></a>
</p>

# stylus-native-loader

A super fast [Stylus](https://stylus-lang.com/) loader for [Webpack](https://webpack.js.org/) that leverages the built-in power of Stylus. Pre-configured for modern development.

Unlike other Stylus loaders available that make use of Webpack's resolver for import path resolution (which comes with several limitations and increased overhead), stylus-native-loader relies on the powerful "native" [@import/require](https://stylus-lang.com/docs/import.html) capabilities of Stylus.

The result is a highly configurable, lean Stylus loader with near-baseline build speeds and unhindered @import/require functionality (with Webpack alias support) 🥳

## Why use this instead of [stylus-loader](https://github.com/webpack-contrib/stylus-loader)?

- It's [really fast](#benchmarks).
- It's fully compatible with Webpack 4 and 5.
- It uses Stylus native [imports](https://stylus-lang.com/docs/import.html), which are extremely fast and flexible.
- It supports Webpack [aliases](https://webpack.js.org/configuration/resolve/#resolvealias) and has automatic tilde path resolution (e.g. `~nib` = `/path/to/node_modules/nib`).
- It generates better source maps with optional content.
- It watches entire directories for changes, e.g. when adding new files with [glob imports](https://stylus-lang.com/docs/import.html#file-globbing).
- It disables all built-in vendor prefixing (by default) in favor of [PostCSS Autoprefixer](https://github.com/postcss/autoprefixer#webpack) or similar.
- It uses raw defines (by default), allowing JS object literals to be passed via options and converted to Stylus hashes.

## Benchmarks

*Build times for the [vuejs.org Stylus source code](https://github.com/vuejs/vuejs.org/tree/master/themes/vue/source/css), sorted from fastest to slowest.*

|                                                              | Min      | Max      | Average      | Overhead |
| ------------------------------------------------------------ | -------- | -------- | ------------ |------------|
| **[stylus](https://stylus-lang.com/docs/js.html)** (no Webpack) | 93.26ms  | 98.72ms | **95.97ms**  |            |
| **stylus-native-loader**                                     | 101.72ms  | 107.23ms | **104.37ms**  | +8.76%     |
| **[stylus-loader](https://github.com/webpack-contrib/stylus-loader)**  | 167.18ms  | 201.92ms | **180.69ms** | +88.28%   |

## Getting started

To begin, install `stylus-native-loader` and `stylus`:

```sh
pnpm add -D stylus-native-loader stylus
# or
npm i -D stylus-native-loader stylus
```

Then add the loader to your **webpack.config.js**. For example, a minimal configuration might look like this:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-native-loader'],
      },
    ],
  },
}
```

## Configuration by example

Below is an example **webpack.config.js** using all `stylus-native-loader` options. None are required.

```js
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // Any "original source" option excluding "eval" enables source map generation
  // @see https://webpack.js.org/configuration/devtool/
  devtool: 'source-map',

  resolve: {
    // All aliases are used for Stylus @import and @require path resolution
    // See `alias` loader option below for adding Stylus-specific aliases
    alias: {
      // A standard alias that matches the first segment of an import path
      // Note: Tilde (~) is not required, but is convention for stylesheet aliases
      // Maps @import '~styl/*' to '/path/to/src/styl/*'
      '~styl': path.join(__dirname, 'src/styl'),

      // An "exact match" alias (i.e. will only match @import 'mixins')
      // @see https://webpack.js.org/configuration/resolve/#resolvealias
      // Maps @import 'mixins' to '/path/to/src/styl/mixins'
      'mixins$': path.join(__dirname, 'src/styl/mixins'),
    },
  },

  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          {
            // Extracts CSS to a separate file
            loader: MiniCssExtractPlugin.loader
          },
          {
            // Translates CSS into CommonJS
            loader: 'css-loader',
            options: {
              // Required for Stylus source map output
              sourceMap: true,
            }
          },
          {
            // Compiles Stylus to CSS
            loader: 'stylus-native-loader',
            options: {
              /**
               * Specify Stylus plugins to use. Plugins can be passed as
               * strings instead of importing them in your Webpack config.
               *
               * @type {string|Function|(string|Function)[]}
               * @default []
               */
              use: 'nib',

              /**
               * Add path(s) to the import lookup paths.
               *
               * @type {string|string[]}
               * @default []
               */
              include: path.join(__dirname, 'src/styl/config'),

              /**
               * Import the specified Stylus files/paths.
               *
               * @type {string|string[]}
               * @default []
               */
              import: [
                'nib',
                path.join(__dirname, 'src/styl/mixins'),
              ],

              /**
               * Define Stylus variables or functions.
               *
               * @type {Object}
               * @default {}
               */
              define: {
                '$development': process.env.NODE_ENV === 'development',
                '$hashvars': { foo: 'bar', bar: 'baz' },
              },

              /**
               * The 3rd parameter of the Stylus `define()` method.
               * Controls whether object literals are converted into
               * hashes (true) or lists/expressions (false).
               *
               * @type {boolean}
               * @default true
               */
              defineRaw: true,

              /**
               * Include regular CSS on @import.
               *
               * @type {boolean}
               * @default false
               */
              includeCSS: false,
                
              /**
               * Resolve relative url()'s inside imported files.
               *
               * @see https://stylus-lang.com/docs/js.html#stylusresolveroptions
               *
               * @type {boolean|Object|'nocheck'}
               * @default false
               */
              resolveUrl: 'nocheck',

              /**
               * Aliases used for @import and @require path resolution.
               * If set, webpack `resolve.alias` config is ignored.
               *
               * @type {Object|false}
               * @default `resolve.alias`
               */
              alias: {
                'mixins': path.join(__dirname, 'src/styl/mixins'),
              },

              /**
               * Non-alias imports beginning with tilde (~) are resolved
               * using `require.resolve()` to find the module's base path.
               *
               * @example @import '~nib' resolves to '/path/to/node_modules/nib'
               *
               * @type {boolean}
               * @default true
               */
              resolveTilde: true,

              /**
               * Toggle built-in Stylus/Nib vendor prefixing.
               * Disabled by default (prefer PostCSS Autoprefixer).
               *
               * @type {boolean}
               * @default false
               */
              vendors: false,
                
              /**
               * Toggle/configure source map generation.
               * Set according to `devtool` config value by default.
               *
               * @see https://stylus-lang.com/docs/sourcemaps.html
               *
               * @type {boolean|Object}
               * @default `devtool`|false
               */
              sourceMap: {
                // Toggle loading of source file contents into source map
                content: true,
                // All other Stylus "sourcemap" options can be set if needed
              },

              /**
               * Toggle watching directories for changes. Allows new files to
               * be detected in watch mode when using glob imports.
               *
               * @type {boolean}
               * @default true
               */
              watchDirs: true,

              /**
               * Callback that triggers right before Stylus compiles,
               * allowing access to the Stylus JS API and loader context.
               * 
               * Note: This is experimental and may prevent proper caching
               * in Webpack. Use at your own risk.
               *
               * @see https://stylus-lang.com/docs/js.html
               *
               * @type {Function}
               * @default undefined
               *
               * @param {Renderer} renderer The stylus renderer instance
               * @param {Object} context The loader context object
               * @param {Object} options The unified stylus options object
               */
              beforeCompile(renderer, context, options) {
                renderer.define('expression', { foo: 'bar', bar: 'baz' })
                renderer.define('hash', { foo: 'bar', bar: 'baz' }, true)
              },

              /**
               * Stylus has several other options/configurations that can be
               * set here and will be passed directly to the Stylus compiler.
               *
               * @see https://stylus-lang.com/docs/js.html
               * @see https://stylus-lang.com/docs/executable.html
               */
            },
          },
        ],
      },
    ],
  },
}
```

## License

[MIT](./LICENSE)
