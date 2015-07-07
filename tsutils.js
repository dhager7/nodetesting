/**
 * Created by delmarhager on 6/25/15.
 */

var path = require('path');
var url = require('url');

function setPath(pathname) {
    if (!path.isAbsolute(pathname)) {
        pathname = path.sep + pathname;
    }
    return __dirname + path.sep + 'tsFiles' + pathname;
}

function filePathFromUrl (resourceUrl ) {
    return setPath(url.parse(resourceUrl).pathname);
}

exports.setPath = setPath;
exports.filePathFromUrl = filePathFromUrl;
