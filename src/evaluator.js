import path from 'path'

import Evaluator from 'stylus/lib/visitor/evaluator'

/**
 * @param {Object|false} aliases
 * @param {boolean} resolveTilde
 *
 * @returns {Function<AliasEvaluator>|boolean}
 */
export default function getAliasEvaluator(aliases, resolveTilde) {
	let nodeModulesPath = null
	let aliasList = null

	function resolveAlias(node) {
		const importPath = node.string
		const firstChar = importPath[0]

		if (firstChar === '/') {
			return importPath
		}

		if (nodeModulesPath === null) {
			nodeModulesPath = getNodeModulesPath()
		}

		if (node.filename.indexOf(nodeModulesPath) === 0) {
			return importPath
		}

		if (aliases) {
			if (aliasList === null) {
				aliasList = getAliasList(aliases)
			}

			for (const entry of aliasList) {
				if (entry.alias === importPath) {
					return entry.path
				}
				else if (!entry.exact && importPath.indexOf(entry.aliasRoot) === 0) {
					return path.join(entry.path, importPath.slice(entry.aliasRoot.length))
				}
			}
		}

		if (resolveTilde && firstChar === '~') {
			return path.join(nodeModulesPath, importPath.slice(1))
		}

		return importPath
	}

	return class AliasEvaluator extends Evaluator {
		visitImport(imported) {
			const node = this.visit(imported.path).first

			if (typeof node.string === 'string' && node.string !== '') {
				node.string = resolveAlias(node)
			}

			return super.visitImport(imported)
		}
	}
}

function getNodeModulesPath() {
	return path.join(process.cwd(), 'node_modules')
}

function getAliasList(aliases) {
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
