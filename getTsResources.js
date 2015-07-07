var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var url = require('url');
var fs = require('fs');
var _ = require('lodash');


function fsCB(err, fd) {
	if (err) {
//		console.log('fs err = ' + JSON.stringify(err));
	} else {

	}
}
var prepareResources = {

	mkdir: function (pathName, successCB) {
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
	},
	catalogSuccess: function (urlString, body) {
		var urlObj = url.parse(urlString);
		prepareResources.mkdir(path.dirname(urlObj.pathname), function () {
			fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
			_.map(body, function (item) {
				var item_url = item.lang_catalog;
				prepareResources.getResource(item, item_url, prepareResources.langSuccess),
					prepareResources.catalogSuccess;
			});
		});
	},
	langSuccess: function (urlString, body) {
		var urlObj = url.parse(urlString);
		prepareResources.mkdir(path.dirname(urlObj.pathname), function () {

			fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
			_.map(body, function (item) {
//				console.log('langSuccss item = ' + JSON.stringify(item))
				prepareResources.getResource(item, item.res_catalog, prepareResources.writeCatalog, prepareResources.langSuccess);
			});
		});
	},
	writeCatalog: function (urlString, body) {
		var urlObj = url.parse(urlString);
		prepareResources.mkdir(path.dirname(urlObj.pathname), function () {
			fs.writeFile(__dirname + urlObj.pathname, JSON.stringify(body), fsCB);
			_.map(body, function (item) {
				prepareResources.getResource(item, item.source, prepareResources.writeSource, prepareResources.writeCatalog);
			});
		});
	},
	writeSourceArray: function (array) {
		_.map(array, function (item) {
			var sourceURL = '';
			if (item.source) {
				sourceURL = item.source;
			} else if (item.res_catalog) {
				sourceURL = item.res_catalog;
			} else if (item.lang_catalog) {
				sourceURL = item.lang_catalog;
			}
			prepareResources.getResource(item, sourceURL, prepareResources.writeSource);
		});
	},
	writeSource: function (urlString, body) {
		var urlObj = url.parse(urlString);
		var fileName = __dirname + urlObj.pathname;
		prepareResources.mkdir(path.dirname(urlObj.pathname), function () {
			fs.writeFile(fileName, JSON.stringify(body), fsCB);
		});


	},
	getResource: function (item, urlString, successCB, errorCB) {
		var urlObj = url.parse(urlString);
		var self = this;
		var missedFiles = [];
		if (urlObj.host) {
			request.get(urlString, {json: true}, function (err, res, body) {
				if (!body) {
					body = '';
				}
				if (!err && res.statusCode === 200) {
					if (successCB) {
						successCB(urlString, body);
					}
				} else {
					if (item) {
						missedFiles.push(item);
						errorCB(urlString, missedFiles);
					}
				}
			})
		}
	}

}

exports.mkdir = prepareResources.mkdir;
exports.getResource = prepareResources.getResource;
exports.catalogSuccess = prepareResources.catalogSuccess;
exports.langSuccess = prepareResources.langSuccess;
exports.writeSourceArray = prepareResources.writeSourceArray;