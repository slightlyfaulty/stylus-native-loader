import fs from 'fs'
import path from 'path'

import stylus from 'stylus'
import pretty from 'pretty-ms'
import delay from 'delay'

import {getCompiler} from './helpers/compiler'

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
	for (const loader of loaders) {
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

		const min = pretty(Math.min(...times), {millisecondsDecimalDigits: 2})
		const max = pretty(Math.max(...times), {millisecondsDecimalDigits: 2})
		const ave = pretty(average(times), {millisecondsDecimalDigits: 2})

		console.log(`\n${loader} - min: ${min}, max: ${max}, ave: ${ave}`)
	}
}

console.log(`Running benchmarks (${iterations} iterations, ${delayMs}ms delay)...`)

runBenchmarks()
