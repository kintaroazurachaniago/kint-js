const qs   = require('querystring')
const path = require('path')
const base = path.resolve()
const sett = require(path.join(base, 'node_modules/kint-js/settings'))
const Kint = require(sett.kintPath)

function httpCallback (req, res, router) {
	const { url, method } = req
	router.logLeft('Request'.colorize('b') + ` : ${url}@${method}`)

	/* handle static files */
	if ( url.split('/')[1] == 'assets' ) return res.end(router.staticFile(url))

	const View 	 = require(sett.viewPath)

	req.params   = url.includes('?') ? qs.parse(url.split('?')[1]) : {}
	res.redirect = router.redirect(res)
	res.json     = data => res.end(JSON.stringify(data))
	res.upload   = router.upload
	res.view     = (path, data={}) => res.end(new View().master(path, data))

	return router[method+'Handler'](req, res)
}

module.exports = new class Router extends Kint {

	routes = []

	constructor () { super() }
	get 				(url, controller, model, method="GET") { this.register(...arguments, model, method) }
	post 				(url, controller, model, method="POST") { this.register(...arguments, model, method) }
	register 		(url, controller, model, method="GET") {
		if ( !model ) model = controller.includes('/') ? controller.split('/')[0] : controller
		this.routes.push({ url, controller, model, method })
	}

	start (port, ...status) {
		const router = this
		require('http')
		.createServer( (req, res) => httpCallback(req, res, router))
		.listen(port, _ => console.log(...status, `http://localhost:${port}/`))
	}

	staticFile (staticPath) {
		let file, error
		try {
			const fs  = require('fs')
			const sfp = path.join(base, staticPath) /* static file path */
			const sfd = fs.readFileSync(sfp) /* static file data */
			file      = sfd
			super.logRight('Success'.colorize('g'))
		} catch ( err ) {
			error = err.toString()
			super.logRight('Failed!'.colorize('r'))
			console.log(error.colorize('r'))
		}
		return file ?? error
	}

	GETHandler (req, res) {
		return this.handler(req, res)
	}

	POSTHandler (req, res) {
		const formidable = require('formidable')
		const form = formidable({ multiples : true, uploadDir : sett.uploadPath })

		form.parse(req, (err, fields, files) => {
			if ( err ) console.log(err.toString().colorize('r'))

			req.body  = fields
			res.files = files

			/* append filename into req.body */
			for ( let[key, val] of Object.entries(files) ) req.body[key] = val.newFilename

			return this.handler(req, res)
		})
	}

	handler (req, res) {
		const Model   = require(sett.modelPath)
		
		const {
			model,
			callback
		} = this.scan(req, res)
		
		if ( !model ) {
			super.logLeft('No model used'.colorize('m'))
			super.logRight('Model is unusable in this route'.colorize('r'))
			return callback(req, res)
		} else {
			super.logLeft(`Using ${model} model`.colorize('c') + ' :')
			super.logRight('Model is usable in this route'.colorize('g'))
			return callback(req, res, new Model(model))
		}
	}

	scan (req, res) {
		const { method, url } = req
		const { routes }      = this
		const justUrl         = req.url.split('?')[0]

		/* there is no routes registered */
		if ( !routes.length ) {
			super.logRight('Failed!'.colorize('r'))
			return { callback : (req, res) => res.end('<h1>No routes registered!</h1>') }
		}

		/* filtering routes that has suitable method with request method */
		const suitableMethod = routes.filter( route => route.method == method )

		/* no routes that has suitable method */
		if ( !suitableMethod.length ) return this.notFound(req, res)

		/* filtering routes that has suitable url with request url */
		const suitableUrl = suitableMethod.filter( route => route.url == justUrl )

		/* suitable methods may contains parameter */
		if ( !suitableUrl.length ) return this.setParams(req, res, suitableMethod)

		/* suitable method and url match */
		return this.setController(req, res, suitableUrl[0])
	}

	notFound (req, res) {
		super.logRight('Failed!'.colorize('r'))
		return {
			callback : (req, res) => {
				res.view('404', { url : req.url, method : req.method })
			}
		}
	}

	setParams (req, res, routes) {
		/* routes that may has parameter */
		const cp = this.containsParameter(req.url, routes) /* contains parameter */

		let match

		while ( cp.length ) {
			const cr        = cp.shift() /* current route */
			const routeDirs = cr.url.split('/')
			const reqDirs   = req.url.split('/')

			let error

			routeDirs.forEach( (dir, x) => {
				if ( !dir.includes(':') && dir != reqDirs[x] ) return error = true
				req.params[dir.slice(1)] = decodeURIComponent(reqDirs[x].split('?')[0])
			})

			if ( !error ) {
				match = cr
				break
			}
		}

		return !match
		? this.notFound(req, res)
		: this.setController(req, res, match)
	}

	containsParameter (reqUrl, routes) {
		return routes.filter( route => {
			const routeDirs     = route.url.split('/')
			const reqDirs       = reqUrl.split('/')
			const similarLength = routeDirs.length == reqDirs.length
			return route.url.includes(':') && similarLength
		})
	}

	setController (req, res, selectedRoute) {
		super.logRight('Success'.colorize('g'))

		const Controller = require(sett.controllerPath)
		const callback   = new Controller(req, res).select(selectedRoute.controller)

		selectedRoute.callback = callback
		return selectedRoute
	}

	redirect (response) {
		/*
		* Returning function that shouldn't has more than 2 parameter
		* When we use res.redirect method. it should be passing 1 or 2 parameter
		* first parameter is targer url to be redirected
		* second parameter is the data to be passed into target
		*/
		return function (url, data, over, res=response) {

			// if third parameter not undefined. it will throwing an error
			if ( over ) throw `Redirect arguments has over! It's only need 2 parameters. 3 prameters are given`

			res.writeHead(302 /* redirect */, { 'Location': url + '?' + querystring.stringify(data) });
			res.end('Redirecting...')
		}
	}

}