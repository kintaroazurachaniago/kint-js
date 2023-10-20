const fs   = require('fs')
const bk   = require('../base-kint')
const sett = require(bk('bind-settings'))

const Kint = require(sett.kintPath)

class View extends Kint {

	script = `
const include = (path, data={}) => new View().include(path, data)
function print (data='') {
	const path       = require('path')
	const fs         = require('fs')
	const base       = path.resolve()
	const outputPath = path.join(base, 'node_modules/kint-js/Output.html')
	fs.appendFileSync(outputPath, data?.toString() ?? '')
}\r\n`
	content = ''

	constructor () { super() }

	master (viewPath, serverData) {
		this.getContent('master')
		this.parseContent()

		this.script += `var content = "${viewPath}";\r\n`
		this.script += `var data = ${JSON.stringify(serverData)};\r\n`
		this.script += this.content

		this.getOutput( false /* default : is include */)

		return this.output
	}

	include (viewPath, serverData) {
		this.getContent(viewPath)
		this.parseContent()

		this.script += `var data = ${JSON.stringify(serverData)};\r\n`
		this.script += this.content

		this.getOutput( true /* is include */ )

		return this.output
	}

	getContent (viewPath) {
		try {
			this.content = super.readFile('views/'+viewPath+'.kint')
		} catch (err) {
			console.error('Cannot load '+viewPath)
			console.error(err)
		}
	}

	parseContent () {
		this.content
		= 'print(`'
		+ this.content
			.replace(/-={/g, '`); print(').replace(/}=-/g, '); print(`') 			/* printing tag */
			.replace(/-=\(/g, '`); include(').replace(/\)=-/g, '); print(`') 	/* including tag */
			.replace(/-=\[/g, '`);').replace(/\]=-/g, '; print(`') 						/* scripting tag*/
		+ '`);'
	}

	getOutput (include=false, error=false) {
		if ( !include ) super.clearFile(sett.outputPath)
		
		try { eval(this.script) }
		catch (err) {
			console.error('Error while evaluating script')
			console.log(err)
			error = true
			fs.writeFileSync(sett.outputPath, err.toString())
		}

		if ( error ) return
		
		try { this.output = super.readFile(sett.outputPath) }
		catch (err) {
			console.error('Cannot load Output.html')
			console.error(err)
		}

	}

}

module.exports = View