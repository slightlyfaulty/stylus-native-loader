import path from 'path'

import stylus from 'stylus'
import nib from 'nib'

import {compile} from './helpers/compiler'

function check(stats, outputIndex = 0) {
	expect(stats.compilation.warnings).toEqual([])
	expect(stats.result.output[outputIndex]).toMatchSnapshot('output')

	if (process.env.DEBUG_OUTPUT) {
		console.debug(stats.result.output[outputIndex])
	}
}

describe("loader", () => {
	it("should work", async () => {
		check(await compile('basic.styl'))
	})

	it("should generate source maps accordingly", async () => {
		// generate source map with full source content (devtool)
		check(await compile('basic.styl', {}, {
			devtool: 'source-map'
		}), 1)

		// generate source map with full source content (sourceMap)
		check(await compile('basic.styl', {
			sourceMap: true
		}, {
			devtool: 'eval-cheap-source-map'
		}), 1)

		// generate source map with without source content
		check(await compile('basic.styl', {
			sourcemap: {
				content: false
			},
		}, {
			devtool: 'source-map'
		}), 1)

		// don't generate source map (devtool)
		check(await compile('basic.styl', {}, {
			devtool: 'eval-cheap-source-map',
		}), 1)

		// don't generate source map (sourceMap)
		check(await compile('basic.styl', {
			sourceMap: false,
		}, {
			devtool: 'source-map'
		}), 1)
	})

	it("should allow using plugins ('use' option)", async () => {
		check(await compile('use.styl', {
			use: nib()
		}))
	})

	it("should allow adding include paths ('include' option)", async () => {
		check(await compile('include.styl', {
			include: path.join(__dirname, 'fixtures/imports')
		}))
	})

	it("should allow importing files ('import' option)", async () => {
		check(await compile('import.styl', {
			import: path.join(__dirname, 'fixtures/imports/a.styl')
		}))
	})

	it("should allow defining variables/functions ('define' option)", async () => {
		const define = {
			'$padding': new stylus.nodes.Unit(10, 'px'),
			'$object': {colors: {primary: '#123456'}},
			'double': n => n.operate('+', n),
		}

		// objects converted to hashes by default
		check(await compile('define.styl', {
			define
		}))

		// objects converted to lists (aka expressions)
		check(await compile('define.styl', {
			define,
			defineRaw: false,
		}))
	})

	it("should allow toggling vendor prefixes ('vendors' option)", async () => {
		// vendors disabled by default
		check(await compile('vendors.styl', {
			use: nib()
		}))

		// vendors enabled
		check(await compile('vendors.styl', {
			use: nib(),
			vendors: true,
		}))
	})

	it("should resolve urls accordingly ('resolveUrl' option)", async () => {
		// resolve urls
		check(await compile('resolveUrl.styl', {
			resolveUrl: true
		}))

		// resolve urls without checking file existence
		check(await compile('resolveUrl.styl', {
			resolveUrl: {nocheck: true}
		}))

		// don't resolve urls
		check(await compile('resolveUrl.styl', {
			resolveUrl: false
		}))
	})

	it("should resolve aliases", async () => {
		const alias = {
			'imp-a$': path.join(__dirname, 'fixtures/imports/a'),
			'~b': path.join(__dirname, 'fixtures/imports/b.styl'),
			'imp': path.join(__dirname, 'fixtures/imports'),
		}

		// resolve aliases set in webpack config
		check(await compile('alias.styl', {}, {
			resolve: {
				alias
			},
		}))

		// resolve aliases set in loader options
		check(await compile('alias.styl', {
			alias
		}))
	})

	it("should resolve tilde paths", async () => {
		check(await compile('tilde.styl'))
	})

	it("should allow toggling CSS file imports ('includeCSS' option)", async () => {
		const alias = {
			'b': path.join(__dirname, 'fixtures/css/b.css'),
		}

		// don't include imported CSS in output by default
		check(await compile('importCSS.styl', {
			alias,
		}))

		// include imported CSS in output
		check(await compile('importCSS.styl', {
			alias,
			includeCSS: true,
		}))
	})

	it("should trigger 'beforeCompile' callback", async () => {
		check(await compile('include.styl', {
			beforeCompile(renderer, context, options) {
				renderer.include(path.join(__dirname, 'fixtures/imports'))

				if (!context.rootContext) {
					throw new Error(`beforeCompile() - invalid "context" parameter.`)
				}

				if (!options.beforeCompile) {
					throw new Error(`beforeCompile() - invalid "options" parameter.`)
				}
			}
		}))
	})

	it("should resolve relative imports", async () => {
		check(await compile('relative/index.styl'))
	})

	it("should resolve glob imports", async () => {
		check(await compile('globs/index.styl', {
			alias: {
				'!': '/some/random/path'
			}
		}))
	})

	it("should work with vue component files", async () => {
		const VueLoaderPlugin = require('vue-loader/lib/plugin')

		check(await compile('vue/index.js', {}, {
			module: {
				rules: [
					{
						test: /\.vue$/,
						loader: 'vue-loader',
					},
				],
			},
			plugins: [
				new VueLoaderPlugin()
			],
		}))
	})
})
