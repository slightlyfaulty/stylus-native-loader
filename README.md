<p align="center">
  <a href="https://stylus-lang.com/"><img src="https://stylus-lang.com/img/stylus-logo.svg" alt="Stylus" title="Stylus" height="80" valign="middle"></a>
  <a href="https://webpack.js.org/"><img src="https://webpack.js.org/assets/icon-square-big.svg" alt="Webpack" title="Webpack" height="120" valign="middle"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/v/stylus-native-loader.svg?sanitize=true" alt="Version"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/stylus-native-loader.svg" alt="Node.js Version"></a>
  <a href="https://david-dm.org/slightlyfaulty/stylus-native-loader"><img src="https://david-dm.org/slightlyfaulty/stylus-native-loader.svg" alt="Dependencies"></a>
  <a href="https://packagephobia.now.sh/result?p=stylus-native-loader"><img src="https://packagephobia.now.sh/badge?p=stylus-native-loader" alt="Size"></a>
</p>

# stylus-native-loader

A super fast [Stylus](https://stylus-lang.com/) loader for [Webpack](https://webpack.js.org/) that leverages the built-in power of Stylus. Configured for modern development.

Unlike other Stylus loaders available that make use of Webpack's resolver for import path resolution (which comes with several limitations and increased overhead), stylus-native-loader relies solely on the powerful "native" [@import/require](https://stylus-lang.com/docs/import.html) capabilities of Stylus.

The result is a highly configurable, lean Stylus loader with near-baseline build speeds and unhindered @import/require functionality (with Webpack alias support) 🥳

## Benchmarks

*Build times for the [vuejs.org Stylus source code](https://github.com/vuejs/vuejs.org/tree/master/themes/vue/source/css), sorted from fastest to slowest.*

|                                                              | Min      | Max      | Average      | Diff %  |
| ------------------------------------------------------------ | -------- | -------- | ------------ | ------- |
| **[stylus](https://stylus-lang.com/docs/js.html)** (no Webpack) | 72.67ms  | 104.75ms | **80.47ms**  |         |
| **stylus-native-loader**                                     | 79.61ms  | 104.26ms | **86.41ms**  | +7.38%  |
| **[stylus-loader](https://github.com/shama/stylus-loader)**  | 85.62ms  | 128.05ms | **104.39ms** | +29.73% |
| **[stylus-relative-loader](https://github.com/walmartlabs/stylus-relative-loader)** | 117.32ms | 198.78ms | **143.10ms** | +77.83% |

## Getting Started

To begin, install `stylus-native-loader` and `stylus`:

```sh
yarn add -D stylus-native-loader stylus
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

## Configuration by Example

Below is an example **webpack.config.js** using all `stylus-native-loader` options. None are required.

```js
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nib = require('nib')

module.exports = {
  // Any "original source" option excluding "eval" enables source map generation
  // @see https://webpack.js.org/configuration/devtool/
  devtool: 'source-map',

  resolve: {
    // All aliases are used for Stylus @import and @require path resolution
    alias: {
      // Maps @import '~styl/*' to '/path/to/src/styl/*'
      '~styl': path.join(__dirname, 'src/styl'),

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
               * Specify Stylus plugins to use.
               *
               * @type {Function|Function[]}
               * @default []
               */
              use: nib(),

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
                '$development': process.env.NODE_ENV === 'development'
              },

              /**
               * The 3rd parameter of the Stylus `define()` method.
               * Controls whether object literals are converted into
               * hashes (true) or lists/expressions (false).
               *
               * @type {boolean}
               * @default true
               */
              defineRaw: false,

              /**
               * Toggle built-in Stylus/Nib vendor prefixing.
               * Disabled by default (prefer PostCSS Autoprefixer).
               *
               * @type {boolean}
               * @default false
               */
              vendors: true,

              /**
               * Resolve relative url()'s inside imported files.
               *
               * @see https://stylus-lang.com/docs/js.html#stylusresolveroptions
               *
               * @type {boolean|Object}
               * @default false
               */
              resolveUrl: true,

              /**
               * Include regular CSS on @import.
               *
               * @type {boolean}
               * @default false
               */
              includeCSS: true,

              /**
               * Aliases used for @import and @require path resolution.
               * If set, uses this instead of Webpack `resolve.alias` config.
               *
               * @type {Object|false}
               * @default `resolve.alias`
               */
              alias: {
                'mixins': path.join(__dirname, 'src/styl/mixins'),
              },

              /**
               * Resolve non-alias paths beginning with `~` to `node_modules`.
               * E.g. @import '~nib' becomes '/path/to/node_modules/nib'.
               *
               * @type {boolean}
               * @default true
               */
              resolveTilde: true,

              /**
               * Callback that triggers right before Stylus compiles,
               * allowing access to the Stylus JS API and loader context.
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
                renderer.define('expression', {foo: 'bar', bar: 'baz'})
                renderer.define('hash', {foo: 'bar', bar: 'baz'}, true)
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
