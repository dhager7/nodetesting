var mkdirp = require('mkdirp');
var url = require('url');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var request = require('request');
var traverse = require('traverse');
var moment = require('moment');
var recursive = require('recursive-readdir');


var tsStaleFiles = [];
var tsIndex = {};

function setPath(pathname) {
    if (!path.isAbsolute(pathname)) {
        pathname = path.sep + pathname;
    }
    return __dirname + path.sep + 'tsFiles' + pathname;
}

function filePathFromUrl(resourceUrl) {
    return setPath(url.parse(resourceUrl).pathname);
}

function fsCB(err, fd) {
    if (err) {
        console.log('fs err = ' + JSON.stringify(err));
    }
}

function setIndex(dataObject, resource) {
    var newUrlObj = url.parse(dataObject);
    var pathname = newUrlObj.pathname;
    var propPath = _.dropRight(_.drop(newUrlObj.pathname.split('/'), 1), 1);
    if (propPath[0] === 'ts') {
        propPath = _.drop(propPath, 3);
    }
    propPath.push(resource);
    propPath = propPath.toString().replace(/,/g, '.');
    _.set(tsIndex, propPath, pathname);

}

function getTSFiles(tsPathName, url, successCB) {
    recursive(tsPathName, function (err, files) {
        // Files is an array of filename
        if (!err) {
            tsStaleFiles = _.clone(files);
        }
        successCB(url, true);
    });
}

function mkdir(pathname, successCB) {

    mkdirp(setPath(pathname), function (err) {
        if (err) {

        } else {
            if (successCB) {
                successCB();
            }
        }
    });
}


function getTsResource(urlString, update) {
    var urlObj = url.parse(urlString);
    var response;
    if (urlObj.host) {
        request.get(urlString, {json: true}, function (err, res, body) {
            if (!err && res.statusCode === 200) {
                response = {body: body, urlString: urlString};
                getTsResources(response, update);
            } else if (!err) {
                console.log('not err status code = ' + res.statusCode);
            } else {
//                console.log('err.code = ' +  err.code + ' - url : ' + urlString);
                if (err.code === 'ETIMEDOUT') {

                    getTsResource(urlString, update);
                }
            }
        })
    }

}

function canUpdateFile(urlString) {
    var urlObj = url.parse(urlString);
    var filePath = setPath(urlObj.pathname);
    var dateString = urlObj.query.slice(-8, -4) + '-' + urlObj.query.slice(-4, -2) + '-' + urlObj.query.slice(-2);
    if (fs.existsSync(filePath)) {
        _.remove(tsStaleFiles, function (name) {
            return filePath === name;
        });
        var fileStat = fs.statSync(filePath);
        if (fileStat.size == 0) {
            return true;
        }
        if (fileStat.isFile()) {
            if (moment(fileStat.birthtime).isBefore(dateString)) {
                return true;
            } else {
                return false;
            }
        }
    }
    return true;
}

function getTsResources(response, update) {
    var urlString = response.urlString;
    var body = response.body;
    var urlObj = url.parse(urlString);
    var newUrlObj;
    var filePath;
    var isResource = urlString.indexOf('resource') > 0;
    mkdir(path.dirname(urlObj.pathname), function () {
        if (update) {
            fs.writeFile(setPath(urlObj.pathname), JSON.stringify(body), fsCB);
        }
        traverse(body).forEach(function (dataObject) {

            if (typeof dataObject === 'string' && dataObject.indexOf('https') >= 0 && dataObject.indexOf('date_modified') >= 0 && dataObject.indexOf('usfm') < 0) {
                setIndex(dataObject, this.key);
                if (dataObject.indexOf('date_modified') >= 0 && canUpdateFile(dataObject)) {
                    getTsResource(dataObject, true);
                } else {
                    var newResponse;
                    newUrlObj = url.parse(dataObject);
                    filePath = setPath(newUrlObj.pathname);
                    if (fs.existsSync(filePath)) {
                        fs.readFile(filePath, 'utf8', function (err, data) {
                            //                           console.log ('file to read = ' + filePath);
                            if (!err) {
                                if (data.length > 0) {
                                    newResponse = {body: JSON.parse(data), urlString: dataObject};
                                    getTsResources(newResponse, false);
                                }
                            }
                        })
                    } else {
                        getTsResource(dataObject, false);
                    }
                }
            }
        });
    });
}

function getTsResourcesFromCatalog(url) {
    console.log('begin');
    getTSFiles(__dirname + path.sep + 'tsFiles', url, getTsResource).then(function () {
            console.log('the end');
        },
        function () {
            console.log('the end2');
        }
    );
    console.log('early end');
}


exports.getTsResourcesFromCatalog = getTsResourcesFromCatalog;
exports.tsStaleFiles = tsStaleFiles;
exports.tsIndex = tsIndex;
