const path         = require('path')
const base         = path.resolve()

const joinBaseKint = (...arguments) => path.join(base, 'node_modules/kint-js', ...arguments)
const joinBase     = (...arguments) => path.join(base, ...arguments)

module.exports = {
	join           : (...arguments) => path.join(...arguments),
	routerPath     : joinBaseKint('classes/Router'),
	modelPath      : joinBaseKint('classes/Model'),
	viewPath       : joinBaseKint('classes/View'),
	controllerPath : joinBaseKint('classes/Controller'),
	kintPath       : joinBaseKint('classes/Kint'),
	dbPath         : joinBaseKint('DB.json'),
	outputPath     : joinBaseKint('Output.html'),
	historyPath 	 : joinBaseKint('history.json'),
	blueprintsPath : joinBaseKint('blueprints/'),
	filesPath 		 : joinBaseKint('files/'),
	pidPath 			 : joinBaseKint('pid'),
	dbsPath        : joinBase('dbs/'),
	modelsPath     : joinBase('models/'),
	viewsPath      : joinBase('views/'),
	controllersPath: joinBase('controllers/'),
	sessionsPath 	 : joinBase('sessions'),
	assetsPath		 : joinBase('assets/'),
	packagePath 	 : joinBase('package.json'),
	cssPath 			 : joinBase('assets/css'),
	imagesPath 		 : joinBase('assets/images'),
	uploadPath 		 : joinBase('assets/images/uploaded'),
	jsPath 		 		 : joinBase('assets/js'),
	mainFile 			 : joinBase('index.js'),
	kintFile 			 : joinBase('kint.js'),
	styleFile 		 : joinBase('assets/css/style.css'),
	scriptFile 		 : joinBase('assets/js/script.js'),
	masterFile 		 : joinBase('views/master.kint'),
	notFoundFile 	 : joinBase('views/404.kint')
}