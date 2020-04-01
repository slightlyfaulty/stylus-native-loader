import {getOptions} from 'loader-utils'

export default function helperLoader(...output) {
	const options = getOptions(this) || {}

	if (options.callback) {
		options.callback({
			output,
			context: this,
			options,
		})
	}

	if (options.clear !== false) {
		this.callback(null, '', ...output.slice(1))
	} else {
		this.callback(null, ...output)
	}
}
