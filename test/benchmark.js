import fs from 'fs'
import path from 'path'

import stylus from 'stylus'
import delay from 'delay'

import { getCompiler } from './helpers/compiler'

const fixture = 'benchmark.styl'
const iterations = 10
const delayMs = 50

const loaders = [
	'stylus-loader',
	'stylus-relative-loader',
	'stylus-native-loader',
	'stylus',
]

function createCompiler(loader) {
	if (loader === 'stylus') return 'stylus'
	if (loader === 'stylus-native-loader') loader = null

	return getCompiler(fixture, null, {}, {}, loader)
}

function compileWebpack(compiler) {
	return (new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err) {
				return reject(err)
			}

			return resolve(stats)
		})
	})).catch(err => {
		console.error(err)
		process.exit()
	})
}

function compileStylus() {
	const file = path.resolve(__dirname, 'fixtures', fixture)

	try {
		stylus(fs.readFileSync(file, 'utf-8'))
			.set('filename', file)
			.render()
	} catch (err) {
		console.error(err)
		process.exit()
	}
}

async function compile(compiler) {
	if (compiler === 'stylus') {
		return compileStylus()
	} else {
		return compileWebpack(compiler)
	}
}

function average(arr) {
	return arr.reduce((p, c) => p + c, 0) / arr.length
}

async function runBenchmarks() {
	const results = []

	for (const loader of loaders) {
		console.log(`Benchmarking ${loader}...`)

		const times = []

		// prime the compiler and fs
		await compile(createCompiler(loader))
		await delay(delayMs)

		for (let i = 0; i < iterations; i++) {
			// initialize the compiler, but don't include it in the benchmark
			const compiler = createCompiler(loader)

			let time = process.hrtime()

			await compile(compiler)

			time = process.hrtime(time)
			times.push((time[0] * 1e9 + time[1]) / 1000000)

			await delay(delayMs)
		}

		results.push({
			loader,
			min: Math.min(...times),
			max: Math.max(...times),
			ave: average(times),
		})
	}

	results.sort((a, b) => a.ave - b.ave)

	const table = {}

	for (const result of results) {
		table[result.loader] = {
			Min: result.min.toFixed(2) + 'ms',
			Max: result.max.toFixed(2) + 'ms',
			Average: result.ave.toFixed(2) + 'ms',
		}

		if (result !== results[0]) {
			table[result.loader]['Overhead'] = '+' + (result.ave / results[0].ave * 100 - 100).toFixed(2) + '%'
		}
	}

	console.table(table)
	process.exit()
}

console.log(`Running benchmarks (${iterations} iterations, ${delayMs}ms delay)...`)

runBenchmarks()
