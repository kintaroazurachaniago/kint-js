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