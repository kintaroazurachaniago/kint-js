const qs   = require('querystring')
const path = require('path')
const ba   = require('../base-app')
const bk   = require('../base-kint')
const sett = require(bk('bind-settings'))

const Kint = require(sett.kintPath)
const View = require(sett.viewPath)

function httpCallback (req, res, router) {

	/* Use external package */
	async function useExternalPackage (x) {
		if ( !router.packages.length ) return
		await router.packages[x](req, res)
		if ( x < router.packages.length - 1 ) return useExternalPackage(x+1)
	}

	useExternalPackage(+0).then( _ => {
		const { url, method } = req
		router.logLeft('Request'.colorize('b') + ` : ${url}@${method}`)

		/* handle static files */
		if ( url.split('/')[1] == 'assets' ) return res.end(router.staticFile(url))

		req.params   = url.includes('?') ? qs.parse(url.split('?')[1]) : {}
		res.redirect = router.redirect(res)
		res.json     = data => res.end(JSON.stringify(data))
		res.upload   = router.upload
		res.view     = (path, data={}) => res.end(new View().master(path, data))

		return new Promise( resolve => resolve(router[method+'Handler'](req, res)))
	})

}

module.exports = new class Router extends Kint {

	routes      = []
	packages = []

	constructor () { super() }
	get 				(url, controller, model, method="GET") { this.register(...arguments, model, method) }
	post 				(url, controller, model, method="POST") { this.register(...arguments, model, method) }
	register 		(url, controller, model, method="GET") {
		if ( !model ) model = controller.includes('/') ? controller.split('/')[0] : controller
		this.routes.push({ url, controller, model, method })
	}

	start (port, ...status) {
		require('http')
		.createServer( async (req, res) => await httpCallback(req, res, this))
		.listen(port, _ => console.log(...status, `http://localhost:${port}/`))
	}

	use (fn) {
		this.packages.push(fn)
	}

	staticFile (staticPath) {
		let file, error
		try {
			const fs  = require('fs')
			const sfp = path.join(ba, staticPath) /* static file path */
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

		req.on("data", onData).on("end", _ => {
			const fs = require('fs')
			/* parsing form */
			req.body = parseForm(extract(req.headers["content-type"], " boundary="), req.data)

			if ( sett.autoUpload ) this.upload()
		  
		  return this.handler(req, res)
		})

		function onData (data) {
			if ( req.data ) {
		    req.data.fill(data, req.dataIndex)
		    req.dataIndex += data.length
		  } else { 
		    var cl = +req.headers["content-length"] /* parse int content length */

		    if ( data.length === cl ) return req.data = data

	      req.data = Buffer.alloc(cl)
	      req.data.fill(data)
	      req.dataIndex = data.length
		  }
		}

		function extract (arr, start, end) {
		  var useIndex = typeof start === "number", i, j

		  if ( useIndex ) {
		    i = start

		    if ( !end ) return arr.slice(1)
		    j = arr.indexOf(end, i)
		    return (j === -1) ? ["", -1] : [ (i === j) ? "" : arr.slice(i, j), j + end.length]
		  } else {
		    i = arr.indexOf(start)
		  
		    if ( i !== -1 ) {
		      i += start.length
		      if ( end ) {
		        j = arr.indexOf(end, i)
		        if (j !== -1) return arr.slice(i, j)
		      } else return arr.slice(i)
		    }
		  
		    return ""
		  }
		}

		function parseForm (boundary, data) {
		  let
			form      = {},
			delimiter = Buffer.from("\r\n--" + boundary),
			body      = extract(data, "--" + boundary + "\r\n"),
			CR        = Buffer.from("\r\n\r\n"),
			i         = 0,
		  head, name, filename, value, obj

		  if ( body ) {
		    while ( i !== -1 ) {
					[head, i]  = extract(body, i, CR)
					name       = extract(head, '; name="', '"').toString();
					filename   = extract(head, '; filename="', '"').toString();
					[value, i] = extract(body, i, delimiter)

		      if ( name ) {
		        obj = filename ? {filename, value} : value.toString()

		        if ( form.hasOwnProperty(name) ) { /* Multiple */
		          if ( Array.isArray(form[name]) ) form[name].push(obj)
		          else form[name] = [form[name], obj]
		        } else form[name] = obj
		      }

		      if ( body[i] === 45 && body[i + 1] === 45 ) break /* "--" */

		      if ( body[i] === 13 && body[i + 1] === 10 ) i += 2 /* "\r\n" */
		      else { /* error */ }
		    }
		  }

		  return form
		}
	}

	/* res.upload() */

	upload () {
		/* Upload file process */
		Object
		.keys(req.body)
		.forEach( key => {
			/* If file, Write file */
			if ( req.body[key].filename ) fs.writeFileSync(path.join(sett.uploadDir, req.body[key].filename), req.body[key].value)
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
			return { callback : (req, res) => res.end(`
				<style>
					* { font-family: monospace; background: black; color: white; }
					.code { font-weight: bold; background: #222; color: black; padding: 10px; border-radius: 5px; margin: 5px auto; display: inline; }
					.exe { color: yellow; background: inherit; }
					.kint { color: lightblue; background: inherit; }
					.action { color: white; background: inherit; }
					.name { color: gray; background: inherit; }
				</style>
				<h1>No routes registered!</h1>
				Run these commands
				<p>Note : replace [name] with mvc name as you want</p>
				<h3>create model, view, controller, and it's route as well at the same times</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">create mvc</span> <span class="name">[name]</span></div>
				<h3>Add new route</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">get</span> <span class="name">[name]</span></div>
				<h3>create new model</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">create model</span> <span class="name">[name]</span></div>
				<h3>create new view</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">create view</span> <span class="name">[name]</span></div>
				<h3>create new controller</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">create controller</span> <span class="name">[name]</span></div>
				<h3>Rolling back actions</h3>
				<div class="code"><span class="exe">node</span> <span class="kint">kint</span> <span class="action">rollback</span></div>
			`) }
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

			res.writeHead(302 /* redirect */, { 'Location': url + '?' + qs.stringify(data) });
			res.end('Redirecting...')
		}
	}

}