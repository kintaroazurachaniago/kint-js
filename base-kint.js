const ba = require('./base-app')

module.exports = function (...arguments) {
	const path = require('path')
	return path.join(ba, 'node_modules/kint-js', ...arguments)
}

// const bk = require('base-kint')
// bk('bind-settings') /* output : ~/node_modules/kint-js/bind-settings */