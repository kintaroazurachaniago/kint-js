const path = require('path')
const base = path.resolve()

const builder = require(path.join(base, 'node_modules/kint-js/classes/Builder'))

/* write main */
builder('build')