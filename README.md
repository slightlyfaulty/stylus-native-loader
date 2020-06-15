<p align="center">
  <a href="https://stylus-lang.com/"><img src="https://stylus-lang.com/img/stylus-logo.svg" alt="Stylus" title="Stylus" height="80" valign="middle"></a>
  <a href="https://webpack.js.org/"><img src="https://webpack.js.org/assets/icon-square-big.svg" alt="Webpack" title="Webpack" height="120" valign="middle"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/v/stylus-native-loader" alt="Version"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/stylus-native-loader" alt="Node.js Version"></a>
  <a href="https://packagephobia.com/result?p=stylus-native-loader"><img src="https://packagephobia.com/badge?p=stylus-native-loader" alt="Size"></a>
  <a href="https://www.npmjs.com/package/stylus-native-loader"><img src="https://img.shields.io/npm/dm/stylus-native-loader" alt="Downloads"></a>
  <a href="https://github.com/slightlyfaulty/stylus-native-loader/issues?q="><img src="https://img.shields.io/maintenance/yes/2020" alt="Maintained"></a>
</p>

# stylus-native-loader

A super fast [Stylus](https://stylus-lang.com/) loader for [Webpack](https://webpack.js.org/) that leverages the built-in power of Stylus. Configured for modern development.

Unlike other Stylus loaders available that make use of Webpack's resolver for import path resolution (which comes with several limitations and increased overhead), stylus-native-loader relies on the powerful "native" [@import/require](https://stylus-lang.com/docs/import.html) capabilities of Stylus.

The result is a highly configurable, lean Stylus loader with near-baseline build speeds and unhindered @import/require functionality (with Webpack alias support) 🥳

## Why use this instead of [stylus-loader](https://github.com/shama/stylus-loader)?

- It's [fast](#benchmarks).
- It's compatible with Webpack 4 and 5.
- It's actively maintained. Stylus-loader has many critical [issues](https://github.com/shama/stylus-loader/issues), with its last commit on Feb 26, 2018.
- It doesn't do any weird/buggy magic to get Stylus working with Webpack. If it works in Stylus, it works in stylus-native-loader.
- It supports webpack [aliases](https://webpack.js.org/configuration/resolve/#resolvealias) and has automatic tilde path resolution (e.g. `~nib` = `/path/to/node_modules/nib`).
- It generates better source maps.
- It disables all built-in vendor prefixing (by default). Vendor prefixing should be done with [PostCSS Autoprefixer](https://github.com/postcss/autoprefixer#webpack) or similar.
- It uses raw defines (by default), allowing JS object literals to be passed via options and converted to Stylus hashes.
- It automatically suppresses Stylus Node.js compatibility warnings (see [below](#stylus-warnings-since-node-v14) for more details).
- Stylus is awesome ❤️ and it deserves an awesome webpack loader.

## Benchmarks

*Build times for the [vuejs.org Stylus source code](https://github.com/vuejs/vuejs.org/tree/master/themes/vue/source/css), sorted from fastest to slowest.*

|                                                              | Min      | Max      | Average      | Diff %  |
| ------------------------------------------------------------ | -------- | -------- | ------------ | ------- |
| **[stylus](https://stylus-lang.com/docs/js.html)** (no Webpack) | 72.67ms  | 104.75ms | **80.47ms**  |         |
| **stylus-native-loader**                                     | 79.61ms  | 104.26ms | **86.41ms**  | +7.38%  |
| **[stylus-loader](https://github.com/shama/stylus-loader)**  | 85.62ms  | 128.05ms | **104.39ms** | +29.73% |
| **[stylus-relative-loader](https://github.com/walmartlabs/stylus-relative-loader)** | 117.32ms | 198.78ms | **143.10ms** | +77.83% |

## Getting started

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

## Stylus warnings since Node v14

If you're using Node.js v14 or later, you may have noticed the annoying warnings caused by Stylus.

```
Warning: Accessing non-existent property 'lineno' of module exports inside circular dependency
```

Look familiar? For some, it's a bearable annoyance. For others, it's the last nail in the coffin of Stylus and its "sporadic" maintenance over the past few years. I for one would like to keep Stylus alive, at least for a while longer. If you're reading this, you're probably not ready to jump ship either.

Unfortunately, not a hell of a lot can be done until stylus/stylus#2538 is merged. Until then, if you're using stylus-native-loader, these warnings will be **automatically suppressed** (by default).

If you're using Stylus plugins that import Stylus themselves (like [nib](https://stylus.github.io/nib/)), be sure to `use` them as strings instead of importing them directly in your webpack config. This allows stylus-native-loader to suppress warnings for those plugins too.

If for some reason you don't want these useless warnings suppressed, you can set the environment variable `STYLUS_NO_COMPAT = 1`.

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
    // See `alias` loader option below for adding stylus-specific aliases
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
               * Specify Stylus plugins to use. Plugins may be passed as
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
               * Include regular CSS on @import.
               *
               * @type {boolean}
               * @default false
               */
              includeCSS: true,
                
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
              vendors: true,
                
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
