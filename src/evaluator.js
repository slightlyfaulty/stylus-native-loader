import path from 'path'

import Evaluator from 'stylus/lib/visitor/evaluator'

import {getAliasList, resolveTildePath} from './util'

/**
 * @param {Object} context
 * @param {Object|false} aliases
 * @param {boolean} resolveTilde
 *
 * @returns {Function<AliasEvaluator>|boolean}
 */
export default function getAliasEvaluator(context, aliases, resolveTilde) {
	let aliasList = null

	function resolveAlias(importPath, filePath) {
		const firstChar = importPath[0]

		if (aliases) {
			if (aliasList === null) {
				aliasList = getAliasList(aliases)
			}

			for (const entry of aliasList) {
				if (entry.alias === importPath) {
					return entry.path
				}
				else if (!entry.exact && importPath.indexOf(entry.aliasRoot) === 0) {
					return path.resolve(entry.path, importPath.slice(entry.aliasRoot.length))
				}
			}
		}

		if (resolveTilde && firstChar === '~') {
			return resolveTildePath(importPath)
		}

		return importPath
	}

	return class AliasEvaluator extends Evaluator {
		visitImport(imported) {
			const node = this.visit(imported.path).first

			if (typeof node.string === 'string' && node.string !== '') {
				node.string = resolveAlias(node.string, node.filename)
			}

			return super.visitImport(imported)
		}
	}
}
