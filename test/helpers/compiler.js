import path from 'path'

import webpack from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'

export function getCompiler(fixture, callback, loaderOptions = {}, config = {}, loader = null) {
	loader = loader || path.resolve(__dirname, '../../src/cjs.js')

	let rules = []
	if (config.module && config.module.rules) {
		rules = config.module.rules
		delete config.module
	}

	const fullConfig = {
		mode: 'development',
		devtool: config.devtool || false,
		context: path.resolve(__dirname, '../fixtures'),
		entry: path.resolve(__dirname, '../fixtures', fixture),
		module: {
			rules: [
				{
					test: /\.styl(us)?$/,
					exclude: /node_modules/,
					use: [
						{loader: path.join(__dirname, 'helperLoader.js'), options: {callback}},
						{loader, options: loaderOptions || {}},
					],
				},
				...rules
			],
		},
		...config
	}

	const compiler = webpack(fullConfig)

	if (!config.outputFileSystem) {
		const outputFileSystem = createFsFromVolume(new Volume())
		// Todo remove when we drop webpack@4 support
		outputFileSystem.join = path.join.bind(path)

		compiler.outputFileSystem = outputFileSystem
	}

	return compiler
}

export function compile(fixture, loaderOptions = {}, config = {}, loader = null) {
	let result = null
	const callback = data => {result = data}

	const compiler = getCompiler(fixture, callback, loaderOptions, config, loader)

	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err) {
				return reject(err)
			}

			if (stats.compilation.errors.length) {
				return reject(stats.compilation.errors)
			}

			stats.result = result

			return resolve(stats)
		})
	})
}
