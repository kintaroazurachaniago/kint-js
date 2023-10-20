const fs   = require('fs')
const bk   = require('./base-kint')
const sett = require(bk('settings'))

try {
	const userSett = JSON.parse(fs.readFileSync(sett.settingsFile))
	Object.keys(userSett).forEach( key => sett[key] = userSett[key])
} catch (err) {
	console.log("User settings doesn't exists!")
	console.log(err)
}

module.exports = sett