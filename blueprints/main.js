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