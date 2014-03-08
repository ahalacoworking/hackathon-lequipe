var $ = require('cheerio');
var URL = require('url');
var Q = require('q');
var _ = require('underscore');
var FS = require('fs');
var Path = require('path');
var Url = require('url');

var DATA_DIR = './data/info/';
var TMP_DIR = './data/tmp/';
var Utils = require('./fetch-utils');

var sourceFile = DATA_DIR + 'StadesCM - Sheet1.csv';
var resultFile = DATA_DIR + 'stades.json';

/* -------------------------------- */
Q().then(function() {
    return Q.all([ Utils.checkDir(TMP_DIR), Utils.checkDir(DATA_DIR) ]);
}).then(function() {
    return Utils.readCsvAsObjects(sourceFile);
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

function extractInfo(url, doc) {
    var properties = {
        type : 'Stade'
    };
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

    geometry.coordinates = Utils.toGeo(infoBlock
            .find('.geo-nondefault span.geo-dec'));

    properties.stadeInfo = extractStructureFromTable(infoBlock);

    console.log(JSON.stringify(result, null, 2));
    return result;
}

function extractStructureFromTable(table) {
    var result = {};
    var photos = [];
    table.find('td[colspan="2"][style="text-align:center"] a.image').each(function(){
        var a = $(this);
        var imgSrc = a.find('img').attr('src');
        var imgHref = a.attr('href');
        if (!Utils.isEmpty(imgSrc) || !Utils.isEmpty(imgHref)) {
            if (imgSrc.match(/\.jpg/gim)) {
                photos.push({
                    src : imgSrc,
                    href : imgHref
                });
            }
        }
    });
    if (photos.length){
        result.photos = photos;
    }

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