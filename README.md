<p align="center">
  <a href="https://stylus-lang.com/"><img src="https://stylus-lang.com/img/stylus-logo.svg" alt="Stylus" title="Stylus" height="80"></a>
  <a href="https://webpack.js.org/"><img src="https://webpack.js.org/assets/icon-square-big.svg" alt="Webpack" title="Webpack" height="120"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/v/stylus-native-loader.svg?sanitize=true" alt="Version"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/stylus-native-loader.svg" alt="Node.js Version"></a>
  <a href="https://david-dm.org/webpack-contrib/stylus-native-loader"><img src="https://david-dm.org/webpack-contrib/stylus-native-loader.svg" alt="Dependencies"></a>
  <a href="https://packagephobia.now.sh/result?p=stylus-native-loader"><img src="https://packagephobia.now.sh/badge?p=stylus-native-loader" alt="Size"></a>
</p>

# stylus-native-loader

A super light-weight [Stylus](https://stylus-lang.com/) loader for [Webpack](https://webpack.js.org/) that leverages the built-in power of Stylus. Configured for modern development workflows.

Unlike other Stylus loaders available, *stylus-native-loader* relies solely on the flexible "native" [@import/require](https://stylus-lang.com/docs/import.html) capabilities of Stylus, rather than hacking Webpack's async resolver to play well with the sync Stylus compiler.

The result is a highly configurable, lean Stylus loader with near-baseline build speeds and unhindered @import/require functionality (with support for Webpack aliases) 🥳

## Benchmarks

*Build times for the [vuejs.org Stylus source code](https://github.com/vuejs/vuejs.org/tree/master/themes/vue/source/css), sorted from fastest to slowest.*

|                                                              | Min      | Max      | Average      | Diff %  |
| ------------------------------------------------------------ | -------- | -------- | ------------ | ------- |
| [**stylus**](https://stylus-lang.com/docs/js.html) (no Webpack) | 72.67ms  | 104.75ms | **80.47ms**  |         |
| **stylus-native-loader**                                     | 79.61ms  | 104.26ms | **86.41ms**  | +7.38%  |
| [**stylus-loader**](https://github.com/shama/stylus-loader)  | 85.62ms  | 128.05ms | **104.39ms** | +29.73% |
| [**stylus-relative-loader**](https://github.com/walmartlabs/stylus-relative-loader) | 117.32ms | 198.78ms | **143.10ms** | +77.83% |

## Getting Started

To begin, install `stylus` and `stylus-native-loader`:

```console
$ yarn add -D stylus stylus-native-loader
OR
$ npm i -D stylus stylus-native-loader
```

Then add the loader to your **webpack.config.js**. For example, a minimal configuration might look like this:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.styl$/i,
        use: ['style-loader', 'css-loader', 'stylus-native-loader'],
      },
    ],
  },
}
```

## Configuration by Example

Below is an example **webpack.config.js** using all stylus-native-loader options. None are required.

```js
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nib = require('nib')

module.exports = {
  // Any "original source" option 
  devtool: 'source-map',

  resolve: {
    // All aliases are used for Stylus @import and @require path resolution
    alias: {
      // Maps @import('~styl/*') to @import('/path/to/src/styl/*')
      '~styl': path.join(__dirname, 'src/styl'),

      // Maps @import('mixins') to @import('/path/to/src/styl/mixins')
      'mixins$': path.join(__dirname, 'src/styl/mixins'),
    },
  },

  module: {
    rules: [
      {
        test: /\.styl$/i,
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
               * Toggle/configure source map generation. This will be
               * set automatically for you according to `devtool`.
               *
               * @see https://stylus-lang.com/docs/sourcemaps.html
               *
               * @type {boolean|Object}
               * @default `devtool`|false
               */
              sourceMap: {
                // Force toggle loading of source map file contents
                content: false,
                // All other Stylus `sourcemap` options can be set if needed
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
