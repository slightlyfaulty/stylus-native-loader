/**
 * This witchcraft gets rid of the annoying warnings caused by Stylus in Node >= 14.
 * As soon as the Stylus pull request is merged and released, this file will be removed.
 *
 * @see https://github.com/stylus/stylus/pull/2538
 * @see https://github.com/slightlyfaulty/stylus-native-loader#stylus-warnings-since-node-v14
 */

const allowSuppressWarnings = (
	!process.env.NODE_NO_WARNINGS
	&& !process.env.STYLUS_NO_COMPAT
	&& +process.version.slice(1, process.version.indexOf('.')) >= 14
)

let listeners = []

function disableWarnings() {
	if (listeners.length) return false

	listeners = process.listeners('warning')

	if (listeners.length) {
		// warnings are only emitted and handled on the next tick
		process.nextTick(() => {
			process.removeAllListeners('warning')
		})
	}
}

function enableWarnings() {
	if (!listeners.length) return false

	// put everything back the way it was. we were never here...
	process.nextTick(() => {
		for (const listener of listeners) {
			process.on('warning', listener)
		}

		listeners = []
	})
}

export const suppressWarnings = allowSuppressWarnings ? callback => {
	disableWarnings()
	const result = callback()
	enableWarnings()
	return result
} : callback => callback()

export const stylus = allowSuppressWarnings
	? suppressWarnings(() => require('stylus'))
	: require('stylus')
