import Evaluator from 'stylus/lib/visitor/evaluator'

/**
 * @param {Object} aliases
 * @returns {Function<AliasEvaluator>|boolean}
 */
export default function getAliasEvaluator(aliases) {
	// only return AliasEvaluator when we actually have aliases
	if (!Object.keys(aliases).length) {
		return false
	}

	const aliasList = []

	for (let [alias, path] of Object.entries(aliases)) {
		let exact = false

		if (alias.slice(-1) === '$') {
			exact = true
			alias = alias.slice(0, -1)
		}

		path = path.replace(/[/\\]+$/, '')

		aliasList.push({
			alias,
			aliasRoot: alias + '/',
			path,
			exact,
		})
	}

	function resolveAlias(path) {
		for (const entry of aliasList) {
			if (entry.alias === path) {
				return entry.path
			} else if (!entry.exact && path.indexOf(entry.aliasRoot) === 0) {
				return entry.path + path.slice(entry.alias.length)
			}
		}

		return path
	}

	return class AliasEvaluator extends Evaluator {
		visitImport(imported) {
			const node = this.visit(imported.path).first

			if (typeof node.string === 'string' && node.string !== '') {
				node.string = resolveAlias(node.string)
			}

			return super.visitImport(imported)
		}
	}
}
