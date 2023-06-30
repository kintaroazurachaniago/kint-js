/*

	Usable model methods

	Create
	.create({ data }) 		// return { ok : true, data } or { error : true, message }

	Read
	.read(fields) 				// return Array with data
	.take(fields) 				// return Object

	Update
	.update({ newData }) 	// return { ok : true, data } or { error : true, message }

	Delete
	.delete()							// return { ok : true } or { error : true, message }

	Selection
	.if(field, value) 		// return Model with selected data
	.if(field, value) 		// return .if method
	.and(field, value) 		// return Model with selected data

*/

const path = require('path')
const base = path.resolve()
const sett = require(path.join(base, 'node_modules/kint-js/settings'))

const Kint   = require(sett.kintPath)

class Model extends Kint {

	name      = undefined
	schema    = undefined
	#data      = undefined
	#selection = false
	#selected  = []

	constructor (name) {
		super()
		this.name   = name
		this.#data   = JSON.parse(super.readFile(path.join(sett.dbsPath, name+'.json')))
		this.schema = require(path.join(base, 'models', name))
	}

	validate (data) {
		const validated = {}
		const lastData  = this.#data[this.#data.length-1]
		const lastID    = lastData ? lastData.id + 1 : 1

		validated.id    = lastID

		for ( let [key, val] of Object.entries(this.schema) ) if ( key != 'id' ) validated[key] = val(data[key])

		return validated
	}

	if (field, value) {
		const available = this.#data[0]
		if ( !available ) return this.end('error', { message : 'This model has no data!' })

		const fields = Object.keys(available)
		if ( !fields.includes(field) ) return this.end('error', { message : `There is no "${field}" field in this model` })

		this.#selection = true
		
		const taken    = []
		const leave    = []

		this.#data.forEach( data => data[field] == value ? taken.push(data) : leave.push(data) )

		this.#selected = this.#selected.concat(taken)
		this.#data     = leave

		return this
	}

	or (field, value) {
		if ( !this.#selection ) return this.end('error', { message : 'Cannot use "or" method before "if"' })
		return this.if(field, value)
	}

	and (field, value) {
		if ( !this.#selection ) return this.end('error', { message : 'Cannot use "and" method before "if"' })

		const taken = []
		const leave = []

		this.#selected.forEach( s => s[field] == value ? taken.push(s) : leave.push(s) )

		this.#selected = taken
		this.#data     = this.#data.concat(leave)

		return this
	}

	take (field, taken) {
		if ( !this.#selection ) return this.end('error', { message : 'Cannot use "take" method before "if"' })

		taken    			 = this.#selected[0]
		this.#data      = this.#data.concat(this.#selected)
		this.#selected  = []
		this.#selection = false

		return taken
	}

	create (data) {
		const validated = this.validate(data)
		this.#data.push(validated)
		this.rewrite()
		return this.end('ok', { data : validated })
	}

	read (field) { /* field = Array */
		const data = this[this.#selection ? 'selected' : 'data']

		if ( !field ) return data

		return data.map( d => {
			const selectedFields = {}
			field.forEach( f => selectedFields[f] = d[f] )
			return selectedFields
		})
	}

	update (newData) {
		const validated = this.validate(newData)
		const data      = this[this.#selection ? 'selected' : 'data']

		const updated   = data.map( d => {
			Object.keys(validated).forEach( v => v !== 'id' ? d[v] = validated[v] : false )
			return d
		})

		this.#data      = this.#selection ? this.#data.concat(updated) : updated
		this.rewrite()

		return { ok : true, data }
	}

	delete () {
		if ( !this.#selection ) return this.end('error', { message : 'Cannot use "delete" method before "if"' })
		if ( !this.#selected.length ) return this.end('warning', { message : 'Empty selected data' })

		let counter = 0
		const ids   = this.#selected.map( s => s.id )

		this.#data   = this.#data.filter( data => {
			if ( ids.includes(data.id) ) return false

			counter++
			return true
		})

		this.rewrite()

		return this.end('ok', { counter })
	}

	rewrite () {
		this.#selection = false
		this.#selected  = []
		super.writeFile(path.join(sett.dbsPath, this.name+'.json'), JSON.stringify(this.#data))
	}

	end (status, data) {
		const reports = {
			ok     : false,
			warning: false,
			error  : false,
			message: undefined,
			data 	 : undefined
		}

		reports[status]  = true

		for ( let [key, val] of Object.entries(data) ) reports[key] = val

		if ( status == 'warning' || status == 'error' ) console.log(reports.message)
		return reports
	}

}

module.exports = Model