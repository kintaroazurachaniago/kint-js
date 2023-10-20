# Welcome to Kint-js Framework
The nodejs web framework is designed to be "**zero dependency**" making it faster and easier to use.
## Installation
```bash
npm install kint-js
```
## Kint builder
Add this command into scripts object inside the **package.json** file
```json
"scripts": {
  "kint": "node node_modules/kint-js/kint"
}
```
And then run the added command
```bash
npm run kint
```
### Basic
Start the app
```bash
node kint start
```
Reset the app
```bash
node kint reset
```
### Add routes
Add new route and then re-arrange routes order automatically
```bash
node kint [method] [url]
```
### Create
Creating model, view, and controller file easily using kint builder
#### model
```bash
node kint create model [model-name]
```
#### view
```bash
node kint create view [view-name]
```
#### controller
```bash
node kint create controller [controller-name]
```
#### model + view + controller
```bash
node kint create mvc [mvc-name@method]
```
### rollback
Rolling back create action
```bash
node kint rollback
```
## Main file
```javascript
const { app, Kint }    = require('kint-js')
const [ port, status ] = [ 4120, 'App started!' ]

/*
* #########################
* use kint object if needed
* kint class has some method that may usefull for you
* some of them are .pkg(), .logLeft(), .logRight()
*/

/*
* #############################
* Using external package method
* Should be pure function | Cannot run class method properly
* @params (request, response) - Always bring these 2 important prameter
* @return <promise> - Executed by async - await function
* Uncomment some lines of code below to try
* Don't forget to install it from npmjs.com "npm i node-session"
*/

// const sess    = require('node-session')
// const session = new sess({ secret : 'asdf' })

// function useSession (req, res) {
// 	return new Promise( resolve => {
// 		session.startSession(req, res, _ => {
// 			resolve('Session started!')
// 		})
// 	})
// }

// app.use(useSession)

/*
* #######################################
* Do not remove "start" and "end" comment
* #######################################
*/

/* start */
/* define routes here (between start and end comments) */
/* end */

app.start(port, status)
```
## Controller file
Just export a function that receive three parameter
```javascript
/* -={name}=- controller */
module.exports = (req, res, Model) => {
	/*
	* model used : -={modelName}=-
	* code...
	*/

	function getMethodHandler () {
		/* get method handler */
		res.view('-={name}=-', { title : '-={name}=-', params : req.params })
	}

	function postMethodHandler () {
		/* Post method handler */
		console.log('Form data :', req.body)
	}

	switch ( req.method ) {
	case 'GET' : getMethodHandler(); 	break
	case 'POST': postMethodHandler(); break
	default    : res.end('Unknown method')
	}
}
```
## Model file
Here we just need to define the type of data should be stored in this model
```javascript
/* -={name}=- Schema */
const -={name}=-Schema = {
	id : Number, /* This field should be exists */
	/* other fields */
}

module.exports = -={name}=-Schema
```
## View files
Before we can render the targeted view, we must have a master view.
### master file
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="/assets/css/style.css">
	<title>-={ data.title }=-</title>
</head>
<body>
	<!-- 
		-=( path, data )=- 	// including tag
		-={ data }=-				// printing tag
		-=[ script ]=-			// scripting tag
	-->
	-=(content, data)=-
	<script src="/assets/js/script.js"></script>
</body>
</html>
```
# Note
```txt
## Update version @1.6.0
+ use method @ Router class
- node-session dependency

###############

Use external package method instead of pure function

Example :

const sess    = require('node-session')
const session = new sess({ secret : 'asdf' })

function useSession (req, res) {
	return new Promise( resolve => {
		session.startSession(req, res, _ => {
			resolve('Session started!')
		})
	})
}

app.use(useSession)

##########

## Update version @1.6.1 -> (zero dependency)
- formidable dependency

## Update version @1.6.6
+ user settings file
+ auto upload switch @ user settings
	{
		"autoUpload":false,
		"uploadDir":"assets/images/upload"
	}
+ upload method @ Router class
	res.uplod()
+ resolve base-app and base-kint path
```
```mermaid
graph
A(Route) --> B((url))
A(Route) --> C(Controller) --> E{Model}
C(Controller) --> D(View) --> F(master)
F(Master) --> G((style))
F(Master) --> H((nav))
F(Master) --> I((content))
F(Master) --> J((footer))
F(Master) --> k((script))
```
# KINTARO XD &copy; Kint-js