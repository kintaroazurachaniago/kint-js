const path   = require('path')

const bk     = require('./base-kint')
const sett   = require(bk('bind-settings'))
const router = require(sett.routerPath)

const Kint   = require(sett.kintPath)

module.exports = { app: router, Kint }