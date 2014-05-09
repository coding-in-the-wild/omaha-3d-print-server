var http = require('http')
var path = require('path')
var crypto = require('crypto')
var fs = require('fs')

var tmpdir = require('os').tmpdir()

function uuid() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}

module.exports = function server(db, admesh) {

	// function getPrice(hash,admeshObject, cb) {
	// 	db.get()
	// }

	function saveAdmeshDataToDatabase(hash, stlFilePath, cb) {
		admesh(stlFilePath, function(err, admeshObject) {
			if (err) {
				cb(err)
			} else {
				db.insert(hash, admeshObject, cb)
			}
		})
	}

	return http.createServer(function(req, res) {
		function sendResponseBack(hash) {
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({
				hash: hash
			}))
		}

		var md5 = crypto.createHash('md5')
		var filePath = path.join(tmpdir, uuid())
		console.log("writing to", filePath)
		var file = fs.createWriteStream(filePath)

		req.on('data', function(data) {
			md5.update(data)
			file.write(data)
		}).on('end', function() {
			file.end(function(err) {
				var hash = md5.digest('hex')
				saveAdmeshDataToDatabase(hash, filePath, function() {
					sendResponseBack(hash)
				})
			})
		})
	})
}
