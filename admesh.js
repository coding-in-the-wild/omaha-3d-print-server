var admeshParser = require('admesh-parser')

module.exports = function(admeshPath) {
	return function(stlPath, cb) {
		admeshParser(admeshPath, [stlPath], cb)
	}
}
