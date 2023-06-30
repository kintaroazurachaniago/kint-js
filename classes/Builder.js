const path = require('path')
const base = path.resolve()
const sett = require(path.join(base, 'node_modules/kint-js/settings'))
const Kint = require(sett.kintPath)

class Builder extends Kint {

	histories = []

	constructor(action, mvc, name) {
		super()
		switch ( action ) {
		case 'build'   : this.build(); break
		case 'reset'   : this.reset(); break
		case 'start'   : this.start(); break
		case 'rollback': this.rollback(); break
		case 'create'  : this.create(mvc, name); break
		case 'get'     : 
		case 'post'    : 
		case 'put'     : 
		case 'patch'   : 
		case 'delete'  : this.addRoute(action /* method */, mvc /* url */); break
		default        : console.log('No action'); break
		}
	}

	getBlueprint (name) {
		return super.readFile(path.join(sett.blueprintsPath, name))
	}

	/* Build mvc structure */
	build () {
		const folders = [
			sett.assetsPath,
			sett.cssPath,
			sett.imagesPath,
			sett.uploadPath,
			sett.jsPath,
			sett.modelsPath,
			sett.viewsPath,
			sett.controllersPath,
			sett.dbsPath
		]

		const files = {}

		files[sett.mainFile]     = this.getBlueprint('main.js')
		files[sett.kintFile]     = this.getBlueprint('kint.js')
		files[sett.styleFile]    = this.getBlueprint('style.css')
		files[sett.scriptFile]   = this.getBlueprint('script.js')
		files[sett.masterFile]   = this.getBlueprint('master.kint')
		files[sett.notFoundFile] = this.getBlueprint('404.kint')

		let error = false
		/* Creating multiple folders */
		folders.forEach( folder => {
			try {
				super.mkdir(folder)
				super.logLeft('Creating'.colorize('b') + ' folder '.colorize('m') + super.pkg().name + folder.split(super.pkg().name)[1])
				super.logRight('Success'.colorize('g'))
			} catch {
				error = true
			}
		})

		if ( error ) return this.ready()

		/* Creating multiple files */
		for ( let[key, val] of Object.entries(files) ) {
			super.logLeft('Creating'.colorize('b') + ' file   '.colorize('m') + super.pkg().name + key.split(super.pkg().name)[1])
			super.writeFile(key, val)
			super.logRight('Success'.colorize('g'))
		}

		this.ready(true)
	}

	ready (newline=false) {
		if ( newline ) console.log()
		/* install nodemon globally */
		console.log('Installing nodemon globally...')
		console.log(require('child_process').execSync('npm i -g nodemon').toString())
		console.log('Package: nodemon installed\r\n')
		console.log('Your'.colorize('w') + ' app '.colorize('m') + 'is' + ' Ready to rock!'.colorize('r'))
		console.log('\r\nrun "node kint start"')
		return
	}

	reset () {
		const folders = [
			sett.assetsPath,
			sett.controllersPath,
			sett.dbsPath,
			sett.modelsPath,
			sett.viewsPath
		]

		const files = [
			sett.mainFile,
			sett.kintFile
		]

		folders.forEach( folder => {
			super.logLeft(`Removing`.colorize('r') + ' folder '.colorize('m') + super.pkg().name + folder.split(super.pkg().name)[1])
			super.rmdir(folder, true)
			super.logRight(`Success`.colorize('g'))
		})

		files.forEach( file => {
			super.logLeft('Deleting'.colorize('r') + ' file   '.colorize('m') + super.pkg().name + file.split(super.pkg().name)[1])
			super.unlink(file)
			super.logRight('Success'.colorize('g'))
		})

		super.writeFile(sett.historyPath, '[]')
	}

	start () {
		const { exec } = require('child_process')
		setTimeout(exec, 1000, `taskkill /f /pid ${process.ppid}`)
		exec('start node node_modules/kint-js/input')
		exec(`start nodemon --ext kint,js ${super.pkg().main}`)
	}

	rollback () {
		const histories   = JSON.parse(super.readFile(sett.historyPath)) /* getting histories */
		const lastHistory = histories.pop()	/* take the last history */

		/* update history */
		super.logLeft('Rolling back '.colorize('b') + 'history'.colorize('m'))
		/* if history empty */
		if ( !lastHistory ) return super.logRight('Empty history!'.colorize('r'))
		super.writeFile(sett.historyPath, JSON.stringify(histories))
		super.logRight('Started'.colorize('g'))

		/* delete multiple files */
		if ( Array.isArray(lastHistory) ) return lastHistory.forEach( lh => this.deleteHistoryFile(lh) )
		/* delete single files */
		return this.deleteHistoryFile(lastHistory)
	}

	deleteHistoryFile (lastHistory) {
		/* delete single file */
		if ( !lastHistory.filename ) return this.removeHistoryRoute(lastHistory)
		super.logLeft('Deleting'.colorize('r') + ' file  '.colorize('m') + super.pkg().name + lastHistory.filename.split(super.pkg().name)[1])
		super.unlink(lastHistory.filename)
		super.logRight('Success'.colorize('g'))
	}

	removeHistoryRoute (lastHistory) {
			const mainFileName    = super.pkg().main
			const mainFileData    = super.readFile(mainFileName)
			const mainFileUpdated = mainFileData.replace(lastHistory.route, '')

			/* update main file */
			super.logLeft('Deleting'.colorize('r') + ' route '.colorize('m') + lastHistory.route)
			super.writeFile(mainFileName, mainFileUpdated) /* rewrite main file */
			super.logRight('Success'.colorize('g'))
	}

	create (mvc, name) { /* mvc = [mvc, model, view, controller], name = [any] */
		return this[mvc](name)
	}

	mvc (name) {
		const
		_name  = name.split('@'),
		method = _name[1] ?? 'get'

		name 	 = _name[0]

		this.model(name, true)						/* create model [name] */
		this.view(name, true)							/* create view [name] */
		this.controller(name, true)				/* create controller [name] */
		this.addRoute(method, name, true)	/* [method=get/post] [name] */

		this.addHistory(this.histories)
		this.histories = []
	}

	model (name, fromMVC=false) {
		const modelName     = name.split('/')[0]
		const modelFilename = path.join(sett.modelsPath, modelName+'.js')
		const dbFilename    = path.join(sett.dbsPath, modelName+'.json')
		const modelHistory 	= { name: modelName, filename: modelFilename }
		const dbHistory 		= { name: modelName, filename: dbFilename }

		super.logLeft('Creating'.colorize('b') + ' model      '.colorize('m') + modelName)
		/* if model exists return */
		if ( super.exists(modelFilename) ) return super.logRight('Already exists!'.colorize('r'))
		super.writeFile(modelFilename, this.getBlueprint('model.js').replace(/-={name}=-/g, modelName))
		super.logRight('Success'.colorize('g'))

		/* model history */
		this.addHistory(modelHistory, fromMVC)

		super.logLeft('Creating'.colorize('b') + ' database   '.colorize('m') + modelName)
		/* if db exists return */
		if ( super.exists(dbFilename) ) return super.logRight('Already exists!'.colorize('r'))
		super.writeFile(dbFilename, '[]')
		super.logRight('Success'.colorize('g'))

		/* db history */
		this.addHistory(dbHistory, fromMVC)
	}

	view (name, fromMVC=false) {
		const filename = path.join(sett.viewsPath, name+'.kint')

		super.logLeft('Creating'.colorize('b') + ' view       '.colorize('m') + name)
		this.writeFile('views', 'view.kint', filename, name.split('/')[0], fromMVC)
	}

	controller (name, fromMVC=false) {
		const filename = path.join(sett.controllersPath, name+'.js')

		super.logLeft('Creating'.colorize('b') + ' controller '.colorize('m') + name)
		this.writeFile('controllers', 'controller.js', filename, name.split('/')[0], fromMVC)
	}

	addRoute (method, name, fromMVC=false) {
		name = (name[0] != '/' ? '/' : '') + name
		
		const mainFile = super.readFile(path.join(base, super.pkg().main))

		let [top, mid, bottom]
			=mainFile
			.split('/* start */')
			.join('-={x}=-')
			.split('/* end */')
			.join('-={x}=-')
			.split('-={x}=-')

		const varname
			=top
			.split('\n')
			.filter( line => line.includes('require') && line.includes('kint-js') )
			.shift()
			.split(' ')[2]
			.replace(',', '')

		super.logLeft('Creating'.colorize('b') + ' route      '.colorize('m') + name+'@'+method)
		
		const newRoute = `${varname.replace(',', '')}.${method}('${name}', '${name.replace('/', '').replace(/:/g, '')}')`

		if ( mid.includes(newRoute) ) return super.logRight('Already exists!'.colorize('r'))

		/* conver mid string into array */
		mid = mid.split('\n').filter( m => m.includes(varname) ).map( f => f.trim() )

		/* adding new route into mid array */
		mid.push(newRoute)

		const detected = {} /* routes that has parameter detected with it parameter index */
		const swapped  = {}	/* routes index and parameters index sum swapped */
		const positive = []	/* routes that has positive index value after multiplied by 10 and y+1 */
		const negative = []	/* routes that has negative index value after multiplied by 10 and -(y+1) */
		const arranged = []	/* routes arranged */
		const get      = ['\r\n\r\n/* GET method */']
		const post     = ['\r\n/* POST method */']
		const history  = { route : newRoute }

		/* fill detected object from mid array */
		mid.forEach( (m, x) => {
			m
			.split("'")[1]
			.split("'")[0]
			.split('/')
			.slice(1)
			.forEach( (f, y) => {
				if ( !detected[x] ) detected[x] = []
				detected[x].push( f[0] == ':' ? (y == 0 ? -100 : 10 * -(y+1)) : (y == 0 ? 100 : 10 * y+1) )
			})
		})

		/* fill swapped object from detected object */
		for ( let[key, val] of Object.entries(detected) ) {
			const reduced = val.reduce( (a, c) => a += c )
			if ( swapped[reduced] ) swapped[reduced].push(key)
			else swapped[reduced] = [key]
		}

		/* fill positive or negative array from swapped object */
		for ( let[key, val] of Object.entries(swapped) ) parseInt(key) > 0 ? positive.push(parseInt(key)) : negative.push(parseInt(key))

		/* fill arranged array from positive array */
		positive.sort().forEach( p => swapped[p].forEach( sp => arranged.push(mid[sp])))

		/* fill arranged array from negative array */
		negative.sort().forEach( n => swapped[n].forEach( sn => arranged.push(mid[sn])))

		/* split array into get and post array */
		arranged.forEach( a => a.split('.')[1].split('(')[0] == 'get' ? get.push(a) : post.push(a))

		/* convert get and post array into string */
		mid = get.concat(post).join('\r\n')

		/* concating top, mid, and bottom element */
		const updatedRoute
			= top
			+ '/* start */'
			+ mid
			+ '\r\n\r\n/* end */'
			+ bottom

		/* rewrite main file */
		super.writeFile(path.join(base, super.pkg().main), updatedRoute)

		/* finished */
		super.logRight('Success'.colorize('g'))

		/* adding history */
		this.addHistory(history, fromMVC)
	}

	writeFile (mvcBases, bp, filename, name, fromMVC=false) {
		let createdDir = path.join(base, mvcBases)
		const history  = { name, filename }

		/* make sure the folder exists or create if it doesn't exists */
		name.split('/').forEach( dir => {
			createdDir = path.join(createdDir, dir)
			if ( !super.exists(createdDir) ) super.mkdir(createdDir)
		})

		/* if file already exists return */
		if ( super.exists(filename) ) return super.logRight('Already exists!'.colorize('r'))

		super.writeFile(filename, this.getBlueprint(bp).replace(/-={name}=-/g, name).replace(/-={modelName}=-/g, name.split('/')[0]))
		super.logRight('Success'.colorize('g'))

		/* adding history */
		this.addHistory(history, fromMVC)
	}

	addHistory (newHistory, fromMVC=false) {
		if ( fromMVC ) return this.histories.push(newHistory)

		const histories = JSON.parse(super.readFile(sett.historyPath))
		histories.push(newHistory)
		super.writeFile(sett.historyPath, JSON.stringify(histories))
	}

}

module.exports = (...arguments) => new Builder(...arguments)