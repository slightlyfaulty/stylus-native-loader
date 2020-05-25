import path from 'path'
import {promises as fs} from 'fs'

import {getOptions} from 'loader-utils'
import stylus from 'stylus'

import {isObject, castArray} from './util'
import getAliasEvaluator from './evaluator'

export default function stylusLoader(source) {
	const callback = this.async()

	// get options passed to loader (with pre Webpack 5 compatibility)
	const loaderOptions = this.getOptions ? this.getOptions() : getOptions(this)

	// clone loader options to avoid modifying this.query
	const options = loaderOptions ? {...loaderOptions} : {}

	// access Webpack config
	const webpackConfig = this._compilation && isObject(this._compilation.options) ? this._compilation.options : {}

	// stylus works better with an absolute filename
	options.filename = options.filename || this.resourcePath

	// get sourcemap option in the order: options.sourceMap > options.sourcemap > this.sourceMap
	if (options.sourceMap != null) {
		options.sourcemap = options.sourceMap
	} else if (options.sourcemap == null && this.sourceMap && (!webpackConfig.devtool || webpackConfig.devtool.indexOf('eval') !== 0)) {
		options.sourcemap = {}
	}

	// set stylus sourcemap defaults
	if (options.sourcemap) {
		if (!isObject(options.sourcemap)) {
			options.sourcemap = {}
		}

		options.sourcemap = Object.assign({
			// enable loading source map content by default
			content: true,
			// source map comment is added by css-loader
			comment: false,
			// set sourceRoot for better handling of paths by css-loader
			sourceRoot: this.rootContext,
		}, options.sourcemap)
	}

	// create stylus renderer instance
	const styl = stylus(source, options)

	// disable all built-in vendor prefixes by default (prefer autoprefixer)
	if (options.vendors !== true) {
		styl.import(path.join(__dirname, '../lib/vendors-official.styl'))
	}

	// add custom include paths
	if ('include' in options) {
		castArray(options.include).forEach(styl.include, styl)
	}

	// add custom stylus file imports
	if ('import' in options) {
		castArray(options.import).forEach(styl.import, styl)
	}

	// enable resolver for relative urls
	if (options.resolveUrl) {
		if (!isObject(options.resolveUrl)) {
			options.resolveUrl = {}
		}

		styl.define('url', stylus.resolver(options.resolveUrl))
	}

	// define global variables/functions
	if (isObject(options.define)) {
		const raw = options.defineRaw == null ? true : options.defineRaw

		for (const entry of Object.entries(options.define)) {
			styl.define(...entry, raw)
		}
	}

	// include regular CSS on @import
	if (options.includeCSS) {
		styl.set('include css', true)
	}

	// resolve webpack aliases using a custom evaluator
	let aliases = 'alias' in options ? options.alias : webpackConfig.resolve.alias
	const resolveTilde = 'resolveTilde' in options ? options.resolveTilde : true

	if (typeof aliases !== 'object' || !Object.keys(aliases).length) {
		aliases = false
	}

	if (aliases || resolveTilde) {
		styl.set('Evaluator', getAliasEvaluator(this, aliases, resolveTilde))
	}

	// keep track of imported files (used by Stylus CLI watch mode)
	options._imports = []

	// trigger callback before compiling
	if (typeof options.beforeCompile === 'function') {
		options.beforeCompile(styl, this, options)
	}

	// let stylus do its magic
	styl.render(async (err, css) => {
		if (err) {
			this.addDependency(err.filename)
			return callback(err)
		}

		// add all source files as dependencies
		if (options._imports.length) {
			for (const importData of options._imports) {
				this.addDependency(importData.path)
			}
		}

		if (styl.sourcemap) {
			// css-loader will set the source map file name
			delete styl.sourcemap.file

			// load source file contents into source map
			if (options.sourcemap && options.sourcemap.content) {
				try {
					styl.sourcemap.sourcesContent = await Promise.all(
						styl.sourcemap.sources.map(file => fs.readFile(file, 'utf-8'))
					)
				} catch (e) {
					return callback(e)
				}
			}
		}

		// donesies :)
		callback(null, css, styl.sourcemap)
	})
}
