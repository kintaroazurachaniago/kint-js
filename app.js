const path = require('path')
const base = path.resolve()
const sett = require(path.join(base, 'node_modules/kint-js/settings'))

const router = require(sett.routerPath)
const Kint   = require(sett.kintPath)

module.exports = { app: router, Kint }