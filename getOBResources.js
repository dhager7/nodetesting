var mkdirp = require('mkdirp');
var url = require('url');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var request = require('request');

function fsCB(err, fd) {
	if (err) {
		console.log('fs err = ' + JSON.stringify(err));
	}
}

function mkdir(pathName, successCB) {
	if (!path.isAbsolute(pathName)) {
		pathName = path.sep + pathName;
	}
	mkdirp(__dirname + pathName, function (err) {
		if (err) {
		} else {
			if (successCB) {
				successCB();
			}
		}
	});
}

function getLang(response) {
	var urlString = response.urlString;
	var body = response.body;
	var urlObj = url.parse(urlString);
	mkdir(path.dirname(urlObj.pathname), function () {
		fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
		_.map(body, function (item) {
			getTsResource(item.res_catalog).then(getResCatalog).then(function (body) {
				},
				function (err) {
					if (err.code === 'ETIMEDOUT') {
						var rep = {body: [item], urlString: item.res_catalog};
						getLang(rep);
					}
				});
		});
	});
}

function getResCatalog(response) {
	var urlString = response.urlString;
	var body = response.body;
	var urlObj = url.parse(urlString);
	mkdir(path.dirname(urlObj.pathname), function () {
		fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
		_.map(body, function (item) {
			getTsResource(item.source).then(writeSource).then(function (body) {
				},
				function (err) {
					if (err.code === 'ETIMEDOUT') {
						var rep = {body: [item], urlString: item.source};
						getResCatalog(rep);
					}
				});
			;
		});
	});
}

function writeSource(response) {
	var urlString = response.urlString;
	var body = response.body;
	var urlObj = url.parse(urlString);
	var fileName = __dirname + urlObj.pathname;
	mkdir(path.dirname(urlObj.pathname), function () {
		fs.writeFile(fileName, JSON.stringify(body), fsCB);
	});
}


function getTsCatalog(response) {
	var urlString = response.urlString;
	var body = response.body;
	var urlObj = url.parse(urlString);
	mkdir(path.dirname(urlObj.pathname), function () {
		fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
		_.map(body, function (item) {
			var item_url = item.lang_catalog;
			getTsResource(item_url).then(getLang).then(function (body) {
				},
				function (err) {
					if (err.code === 'ETIMEDOUT') {
						var rep = {body: [item], urlString: item.lang_catalog};
						getTsCatalog(rep);
					}
				});
		});
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

function getTsResourcesFromCatalog(url) {
	getTsResource(url).then(getTsCatalog).then(function (body) {
		},
		function (err) {
			if (err.code === 'ETIMEDOUT') {
				getTsResourcesFromCatalog(url);
			}
		}
	)
}

exports.getTsResourcesFromCatalog = getTsResourcesFromCatalog;
