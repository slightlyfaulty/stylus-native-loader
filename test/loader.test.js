import path from 'path'

import stylus from 'stylus'
import nib from 'nib'

import {compile} from './helpers/compiler'

function check(stats, outputIndex = 0) {
	expect(stats.compilation.warnings).toEqual([])
	expect(stats.loader.output[outputIndex]).toMatchSnapshot('output')

	if (process.env.DEBUG_OUTPUT) {
		console.debug(stats.loader.output[outputIndex])
	}
}

describe("loader", () => {
	it("should work", async () => {
		check(await compile('basic.styl'))
	})

	it("should generate sourcemaps", async () => {
		check(await compile('basic.styl', {}, {
			devtool: 'source-map'
		}), 1)

		check(await compile('basic.styl', {
			sourceMap: true
		}, {
			devtool: 'eval-cheap-source-map'
		}), 1)

		check(await compile('basic.styl', {
			sourcemap: {
				content: false
			},
		}, {
			devtool: 'source-map'
		}), 1)
	})

	it("should not generate sourcemaps", async () => {
		check(await compile('basic.styl', {}, {
			devtool: 'eval-cheap-source-map',
		}), 1)

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
		check(await compile('define.styl', {
			define: {
				'$padding': new stylus.nodes.Unit(10, 'px'),
				'double': n => n.operate('+', n),
			}
		}))
	})

	it("should not add vendor prefixes ('vendors' option)", async () => {
		check(await compile('vendors.styl', {
			use: nib()
		}))
	})

	it("should add vendor prefixes ('vendors' option)", async () => {
		check(await compile('vendors.styl', {
			use: nib(),
			vendors: true,
		}))
	})

	it("should resolve urls accordingly ('resolveUrl' option)", async () => {
		check(await compile('resolveUrl.styl', {
			resolveUrl: true
		}))

		check(await compile('resolveUrl.styl', {
			resolveUrl: {nocheck: true}
		}))

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

		check(await compile('alias.styl', {}, {
			resolve: {
				alias
			},
		}))

		check(await compile('alias.styl', {
			alias
		}))
	})

	it("should import CSS files ('includeCSS' true)", async () => {
		process.env.DEBUG_OUTPUT = true
		check(await compile('importCSS.styl', {
			includeCSS: true,
			alias: {
				'b': path.join(__dirname, 'fixtures/css/b.css'),
			}
		}))
	})

	it("should not import CSS files ('includeCSS' false)", async () => {
		process.env.DEBUG_OUTPUT = true
		check(await compile('importCSS.styl', {
			alias: {
				'b': path.join(__dirname, 'fixtures/css/b.css'),
			}
		}))
	})

	it("should resolve relative imports", async () => {
		check(await compile('relative/index.styl'))
	})
})
