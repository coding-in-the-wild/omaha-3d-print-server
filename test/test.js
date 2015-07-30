var test = require('tap').test
var request = require('request')
var concat = require('concat-stream')
var fs = require('fs')
var newServer = require('../index.js')
var Database = require('omaha-3d-print-database')
var Admesh = require('admesh-parser')

//var pathToAdmesh = "/Users/josh/admesh-0.95/admesh"
var pathToAdmesh = 'C:/Program Files (x86)/admesh/admesh.exe'

test("The admesh data is saved to the database correctly", function(t) {
	var db = Database()

	var admesh = new Admesh(pathToAdmesh)

	var fileStream = fs.createReadStream('./companion-cube-2.stl')

	var server = newServer(db, admesh)

	server.listen(9001)

	var req = request.post("http://localhost:9001/upload", function(err, res, body) {
		t.notOk(err, 'no error in http request')

		body = JSON.parse(body)
		var hash = body.hash

		t.ok(typeof body.hash === 'string', 'The response has a hash property that is a string')
		t.equal(body.hash, 'd372818be56327b94ad912f903b33b2f')

		t.ok(typeof body.price === 'number', 'The price is a number')

		db.get(hash, function(err, admeshData) {
			t.notOk(err, 'no error pulling from db')
			t.equals(typeof admeshData, 'object', 'admeshData is an object')
			//t.ok(admeshData && admeshData.volume > 94587 && admeshData.volume < 94588, 'The volume is correct')
			t.ok(admeshData && admeshData.volume > 33.48 && admeshData.volume < 33.49, 'The volume is correct')
			console.log("vol:",admeshData.volume)
			t.end()
		})

		server.close()
	})

	fileStream.pipe(req)
})

