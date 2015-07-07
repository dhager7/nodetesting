var resources = require('./downloader');
var path = require('path');
var index = require('./index');
var prettyjson = require('prettyjson');
var pr;
var indexer = require('./indexer');
var rootDir = __dirname;
var dataDir = rootDir + path.sep + 'tsFiles';

function myResolve() {
    console.log('resolved');
}

pr = new resources.Resources('https://api.unfoldingword.org/ts/txt/2/catalog.json',
    dataDir);

var pr1 = new resources.Resources('https://api.unfoldingword.org/ts/txt/2/col/en/resources.json',
    dataDir);


var pr2 = new resources.Resources('https://api.unfoldingword.org/ts/txt/2/catalog.json',
    dataDir);

pr1.downloadProject('',

    function (self) {
        console.log('Project = \n' + prettyjson.render(indexer.indexFiles('ts/txt/2/catalog.json', dataDir)));
    });


pr.downloadProject('job',

    function (self) {
        console.log('Project = \n' + prettyjson.render(indexer.indexFiles('ts/txt/2/catalog.json', dataDir)));
    });

pr1.getTsResourcesFromCatalog('col.ar.avd', function () {
    console.log('resource = \n' + prettyjson.render(indexer.indexFiles('ts/txt/2/catalog.json', dataDir)));
});


pr.downloadLanguageList('col', function (list) {
    console.log('lang list = \n' + prettyjson.render(list));

});

pr.downloadProjectList(function (resource) {
    console.log('project list = \n' + prettyjson.render(resource));
});


console.log('lang file = \n' + prettyjson.render(pr.downloadLanguage('col', 'ar')));


pr.downloadProject('col', function () {
    console.log('project download = \n' + prettyjson.render(indexer.indexFiles('ts/txt/2/catalog.json', dataDir)));
    console.log('lang file = \n' + prettyjson.render(pr.downloadLanguage('col', 'en')));

});


console.log('lang file = \n' + prettyjson.render(pr.downloadLanguage('col', 'en')));


console.log('finishing');







