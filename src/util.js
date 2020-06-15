import path from 'path'

/**
 * @param {Object} context The loader context
 *
 * @return {Object}
 */
export function getOptions(context) {
	if (typeof context.getOptions === 'function') {
		return context.getOptions()
	} else {
		return require('loader-utils').getOptions(context)
	}
}

/**
 * @return {boolean}
 */
export function isObject(value) {
	return typeof value === 'object' && value !== null
}

/**
 * @return {Array}
 */
export function castArray(value) {
	if (value == null) {
		return []
	} else if (Array.isArray(value)) {
		return value
	} else {
		return [value]
	}
}

/**
 * @param {Object} aliases
 *
 * @return {Array}
 */
export function getAliasList(aliases) {
	const aliasList = []

	if (typeof aliases !== 'object') {
		return aliasList
	}

	for (let [alias, aliasPath] of Object.entries(aliases)) {
		let exact = false

		if (alias.slice(-1) === '$') {
			exact = true
			alias = alias.slice(0, -1)
		}

		aliasList.push({
			alias,
			aliasRoot: alias + '/',
			path: aliasPath.replace(/[/\\]+$/, ''),
			exact,
		})
	}

	return aliasList
}

/**
 * @param {string} importPath
 *
 * @return {string}
 */
export function resolveTildePath(importPath) {
	const target = importPath.slice(1)
	const resolved = require.resolve(target)
	const nodeModulesPos = resolved.lastIndexOf(path.sep + 'node_modules' + path.sep)

	if (nodeModulesPos !== -1) {
		return path.resolve(resolved.slice(0, nodeModulesPos), 'node_modules', target)
	} else {
		return path.dirname(resolved)
	}
}
