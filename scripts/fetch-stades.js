var $ = require('cheerio');
var URL = require('url');
var Q = require('q');
var _ = require('underscore');
var Readline = require('readline');
var FS = require('fs');
var Path = require('path');
var Url = require('url');
var CsvSplitter = require('./csv-splitter');

var DATA_DIR = './data/info/';
var TMP_DIR = './data/tmp/';
var Utils = require('./fetch-utils');

var sourceFile = DATA_DIR + 'StadesCM - Sheet1.csv';
var resultFile = DATA_DIR + 'stades.json';

/* -------------------------------- */
Q().then(function() {
    return Q.all([ Utils.checkDir(TMP_DIR), Utils.checkDir(DATA_DIR) ]);
}).then(function() {
    return readCsvAsObjects(sourceFile);
}).then(function(stads) {
    return Q.all(_.filter(_.map(stads, function(stad) {
        var url = Utils.trim(stad['Stade URL']);
        if (!url.match(/^http:/))
            return;
        var year = parseInt(Utils.trim(stad['Année']));

        console.log('Loading info from URL: "' + url + '"...');
        return Utils.loadPage({
            url : url,
            dir : TMP_DIR,
            reload : false
        }).then(function(doc) {
            var obj = extractInfo(url, doc);
            obj.properties.matchYear = year;
            console.log('Done: URL: "' + url + '".');
            return obj;
        });
    }), function(obj) {
        return obj ? true : false;
    })).then(function(info) {
        console.log('Writing data in file: "' + resultFile + '"...');
        return Utils.writeJson(resultFile, info).then(function() {
            console.log('Done.');
        });
    })
}).done();

function readCsvAsObjects(file) {
    var results = [];
    return readCsv(file, function(obj) {
        console.log(obj);
        results.push(obj);
    }).then(function() {
        return results;
    });
}

function readCsv(file, callback) {
    var deferred = Q.defer();
    try {
        var first = true;
        var headers = [];
        var splitter = new CsvSplitter({
            delim : ','
        });
        Readline.createInterface({
            input : FS.createReadStream(file),
            terminal : false
        }).on('line', function(line) {
            var array = splitter.splitCsvLine(line);
            array = _.map(array, function(str) {
                str = Utils.trim(str);
                return str;
            });
            if (first) {
                headers = array;
            } else {
                var obj = splitter.toObject(headers, array);
                callback(obj);
            }
            first = false;
        }).on('close', function() {
            deferred.resolve();
        });
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}

function toGeo(elm) {
    var str = $($(elm)[0]).text();
    var array = str.split(/\s*,\s*/gim);
    try {
        return [ parseFloat(array[0]), parseFloat(array[1]) ];
    } catch (e) {
        return undefined;
    }
}

function extractInfo(url, doc) {
    var properties = {};
    var geometry = {
        type : 'Point',
    };
    var result = {
        type : 'Feature',
        properties : properties,
        geometry : geometry
    };

    var body = doc.find('body');
    properties.title = Utils.normalize(body.find('.firstHeading').text());
    properties.wikipedia = url;

    var infoBlock = body.find('.infobox_v3')
    if (!infoBlock[0]) {
        infoBlock = body.find('.infobox_v2');
    }
    Utils.resolveRefs(url, infoBlock);

    geometry.coordinates = toGeo(infoBlock.find('.geo-nondefault span.geo-dec'));

    properties.stadeInfo = extractStructureFromTable(infoBlock);

    console.log(JSON.stringify(result, null, 2));
    return result;
}

function extractStructureFromTable(table) {
    var result = {};
    var idx = 0;
    table.find('tr').each(function() {
        var tr = $(this);
        var key = Utils.normalize($(tr.find('th')[0]).text());
        var value = Utils.normalize($(tr.find('td')[0]).text());
        if (!Utils.isEmpty(key) && !Utils.isEmpty(value)) {
            result[key] = value;
        }
    })
    return result;
}