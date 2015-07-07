/**
 * Created by delmarhager on 6/25/15.
 */
var tsUtils = require('./tsutils');
var fs = require('fs');
var _ = require('lodash');

function readFile(filename, enc){
    return new Promise(function (fulfill, reject){
        fs.readFile(filename, enc, function (err, res){
            if (err) reject(err);
            else fulfill(res);
        });
    });
}


function getURL(res, searchProperty, urlProperty){
    return new Promise(function (fulfill, reject) {
            var catEntries, url;
            catEntries = _.find(res, function (catObj) {
                return catObj.slug === searchProperty;
            });
            if (catEntries) {
                url = catEntries[0][urlProperty];
                fulfill(url);
            } else {
                reject('');
            }
        }
    );
}


function readJSON(filename){
    return readFile(filename, 'utf8').then(function (res){
        return JSON.parse(res)
    })
}


function getCatalog(project, language, resource) {
    return readJSON (tsUtils.filePathFromUrl('https://api.unfoldingword.org/ts/txt/2/catalog.json')).then(getURL(res, project, 'slug'));
}

function getSource(project, language, resource, cb) {
    var contents = {};
    getCatalog().then(function(res) {
        cb (res)
    });
}

exports.getSource = getSource;
