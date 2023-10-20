const path = require('path')
const ba   = require('./base-app')
const bk   = require('./base-kint')

module.exports = {
	routerPath     : bk('classes/Router'),
	modelPath      : bk('classes/Model'),
	viewPath       : bk('classes/View'),
	controllerPath : bk('classes/Controller'),
	kintPath       : bk('classes/Kint'),
	dbPath         : bk('DB.json'),
	outputPath     : bk('Output.html'),
	historyPath 	 : bk('history.json'),
	blueprintsPath : bk('blueprints/'),
	filesPath 		 : bk('files/'),
	pidPath 			 : bk('pid'),
	dbsPath        : path.join(ba, 'dbs/'),
	modelsPath     : path.join(ba, 'models/'),
	viewsPath      : path.join(ba, 'views/'),
	controllersPath: path.join(ba, 'controllers/'),
	sessionsPath 	 : path.join(ba, 'sessions'),
	assetsPath		 : path.join(ba, 'assets/'),
	packagePath 	 : path.join(ba, 'package.json'),
	cssPath 			 : path.join(ba, 'assets/css'),
	imagesPath 		 : path.join(ba, 'assets/images'),
	uploadDir 		 : path.join(ba, 'assets/images/uploaded'),
	jsPath 		 		 : path.join(ba, 'assets/js'),
	mainFile 			 : path.join(ba, 'index.js'),
	kintFile 			 : path.join(ba, 'kint.js'),
	styleFile 		 : path.join(ba, 'assets/css/style.css'),
	scriptFile 		 : path.join(ba, 'assets/js/script.js'),
	masterFile 		 : path.join(ba, 'views/master.kint'),
	notFoundFile 	 : path.join(ba, 'views/404.kint'),
	settingsFile 	 : path.join(ba, 'settings.json')
}