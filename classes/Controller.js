const path = require('path')
const base = path.resolve()
const settings = require(path.join(base, 'node_modules/kint-js/settings'))

class Controller {

	constructor (req, res) {
		this.req = req
		this.res = res
	}

	select (filename) {
		try {
			const controller = require(path.join(settings.controllersPath, filename))
			if ( typeof controller == 'object' ) throw `\r\nYou haven't export ${filename} controller yet!\r\n`
			if ( typeof controller == 'function' ) return controller
		} catch (err) {
			console.error('Cannot load ' + filename + ' controller')
			console.log(err.toString())
			return this.default
		}
	}

	default (req, res, Model, name) {
		res.end('Controller ' + name + ' not found!')
	}

}

module.exports = Controller