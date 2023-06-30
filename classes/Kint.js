const fs = require('fs')
const path = require('path')
const base = path.resolve()

String.prototype.colorize = function (c) {
	const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    black: '\x1b[30m',
    r: '\x1b[31m',
    g: '\x1b[32m',
    b: '\x1b[34m',
    y: '\x1b[33m',
    m: '\x1b[35m',
    c: '\x1b[36m',
    w: '\x1b[37m',
    bgBlack: '\x1b[40m',
    bgr: '\x1b[41m',
    bgg: '\x1b[42m',
    bgb: '\x1b[44m',
    bgy: '\x1b[43m',
    bgm: '\x1b[45m',
    bgc: '\x1b[46m',
    bgw: '\x1b[47m'
  }
  return !colors[c] ? this : colors[c] + this + colors.reset
}

function write (...arguments) { process.stdout.write(arguments.join('')) }

function logRow (...arguments) {
	console.log(...arguments)
	const columns = process.stdout.columns
	for ( let x = 0; x < columns; x++ ) {
		if ( x+1 == columns ) write('\r\n')
		else write('-')
	}
}

function color (t, c) {
  const colors = {
    reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m', underscore: '\x1b[4m', blink: '\x1b[5m', reverse: '\x1b[7m', hidden: '\x1b[8m',
    black: '\x1b[30m', r: '\x1b[31m', g: '\x1b[32m', b: '\x1b[34m', y: '\x1b[33m', m: '\x1b[35m', c: '\x1b[36m', w: '\x1b[37m',
    bgBlack: '\x1b[40m', bgr: '\x1b[41m', bgg: '\x1b[42m', bgb: '\x1b[44m', bgy: '\x1b[43m', bgm: '\x1b[45m', bgc: '\x1b[46m', bgw: '\x1b[47m'
  }
  return !colors[c] ? t : colors[c] + t + colors.reset
}

class Kint {

	#left = ''
	#right = ''

	upload (files, folder='/') {
		for ( let file of Object.values(files) ) {
			const filename = path.join(folder, file.originalFilename)
			const filepath = path.join(base, filename)
			fs.renameSync(file.filepath, filepath)
		}
	}

	logLeft (text) {
		this.#left = text
		return process.stdout.write(text)
	}

	logRight (text) {
		let width = process.stdout.columns - text.length
		if ( width.toString() == 'NaN' ) width = 70
		for ( let x = this.#left.trim().length; x < width; x++ ) process.stdout.write( x == this.#left.length || x == width - 1 ? ' ' : '-'.colorize('dim'))
		process.stdout.write(text + '\r\n')
	}

	writeLog () { return writeLog(...arguments) }
	write () { return write(...arguments) }
	log () { return console.log(...arguments) }
	logRow () { return logRow(...arguments) }
	color (t, c) { return color(t, c) }

	pkg () {
		return JSON.parse(this.readFile(path.join(base, 'package.json')))
	}

	exists (dir) {
		return fs.existsSync(dir)
	}

	mkdir (dir) {
		return fs.mkdirSync(dir)
	}

	readdir (dir) {
		return fs.readdirSync(dir)
	}

	rmdir (dir, recursive=false) {
		return new Promise( resolve => {
			fs.rm(dir, { recursive }, err => {
				resolve(err ? 'Failed to remove dir ' + dir : 'Success!\t' + dir + ' deleted.')
			})
		})
	}

	readFile (filename) {
		try {
			return fs.readFileSync(filename, 'utf8')
		} catch (err) {
			console.log('Failed to read file')
			console.log(err)
		}
	}

	writeFile (filename, data) {
		try {
			return fs.writeFileSync(filename, data.toString())
		} catch (err) {
			if ( !data ) console.log('Writing a file need some data {string}')
			throw err
		}
	}

	appendFile (filename, data) {
		try {
			return fs.appendFileSync(filename, data)
		} catch (err) {
			throw err
		}
	}

	unlink (filename) {
		try {
			fs.unlinkSync(filename)
			return 'Success!\t' + filename + ' deleted.'
			return
		} catch (err) {
			throw err
		}
	}

	clearFile (filename) {
		return this.writeFile(filename, '')
	}

}

module.exports = Kint