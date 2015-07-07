var mkdirp = require('mkdirp');
var url = require('url');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var request = require('request');
var traverse = require('traverse');
var count = 0;

function fsCB(err, fd) {
	if (err) {
		console.log('fs err = ' + JSON.stringify(err));
	}
}

function setPath(pathName) {
	return __dirname + path.sep + 'tsFiles' + pathName;
}

function mkdir(pathname, successCB) {
	if (!path.isAbsolute(pathname)) {
		pathname = path.sep + pathname;
	}
	console.log ('pathname = ' + setPath(pathname));
	mkdirp(setPath(pathname), function (err) {
		if (err) {
			console.log ('error in creating pathname = ' + pathname);
		} else {
			if (successCB) {
				successCB();
			}
		}
	});
}


function getTsResource(urlString) {
	return new Promise(function (resolve, reject) {
		var urlObj = url.parse(urlString);
		var response;
		if (urlObj.host) {
			request.get(urlString, {json: true}, function (err, res, body) {
				if (!err && res.statusCode === 200) {
					response = {body: body, urlString: urlString};
					resolve(response);
				} else {
					reject(err)
				}
			})
		}
	});
}


function getTsResources(response) {
	var urlString = response.urlString;
	var body = response.body;
	var urlObj = url.parse(urlString);
	mkdir(path.dirname(urlObj.pathname), function () {

		fs.writeFile(setPath( urlObj.pathname), JSON.stringify(body), fsCB);

		traverse(body).forEach (function(dataObject) {
			if (typeof dataObject === 'string' && dataObject.indexOf('https') >= 0 && dataObject.indexOf('date_modified')  >= 0){
				console.log(dataObject);
				getTsResource(dataObject).then(getTsResources).then(function (body) {
					},
					function (err) {
						if (err.code === 'ETIMEDOUT') {
							console.log ('ETIMEDOUT = ' + dataObject);
							getTsResource(dataObject).then(getTsResources).then(function () {
							},
							function(err) {
								console.log ('error code 2 = ' + err.code);
							});
						}
					})
			}
		});
	});
}

function getTsResourcesFromCatalog(url) {
	getTsResource(url).then(getTsResources).then(function (body) {
		},
		function (err) {
			if (err.code === 'ETIMEDOUT') {
				getTsResourcesFromCatalog(url);
			}
		}
	)
}

exports.getTsResourcesFromCatalog = getTsResourcesFromCatalog;
