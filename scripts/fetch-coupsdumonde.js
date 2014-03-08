var $ = require('cheerio');
var URL = require('url');
var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var Path = require('path');
var Url = require('url');

var DATA_DIR = './data/info/';
var TMP_DIR = './data/tmp/';
var Utils = require('./fetch-utils');

var coupsDuMondeInfo = DATA_DIR + 'coupsDuMondeInfo.json';
var urlMask = 'http://fr.wikipedia.org/wiki/Coupe_du_monde_de_football_de_<%=year%>';

var years = [ 1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978,
        1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010 ]

/* -------------------------------- */
Q().then(function() {
    return Q.all([ Utils.checkDir(TMP_DIR), Utils.checkDir(DATA_DIR) ]);
}).then(function() {
    return Q.all(_.map(years, function(year) {
        var url = _.template(urlMask, {
            year : year
        })
        console.log('Loading info from URL: "' + url + '"...');
        return Utils.loadPage({
            url : url,
            dir : TMP_DIR,
            reload : false
        }).then(function(doc) {
            var obj = extractInfo(url, doc);
            obj.properties.year = year;
            console.log('Done: "' + obj.title + '". URL: "' + url + '".');
            return obj;
        });
    })).then(function(info) {
        console.log('Writing data in file: "' + coupsDuMondeInfo + '"...');
        return Utils.writeJson(coupsDuMondeInfo, info).then(function() {
            console.log('Done.');
        });
    })
}).done();

function extractInfo(url, doc) {
    var properties = {
        type : 'CoupDuMonde'
    };
    var result = {
        properties : properties
    };

    var body = doc.find('body');
    result.title = Utils.normalize(body.find('.firstHeading').text());

    var infoBlock = body.find('.infobox_v3')
    Utils.resolveRefs(url, infoBlock);

    var logo = infoBlock.find('.thumbinner')
    properties.year = 0;
    properties.wikipedia = url;
    properties.logo = {
        src : logo.find('img').attr('src'),
        href : logo.find('a').attr('href')
    }

    properties.info = extractStructureFromTable(infoBlock.find('table'));
    properties.teams = extractTeamInfo(body);
    return result;
}

function extractTeamInfo(body) {

}

function extractStructureFromTable(table) {
    var result = {};
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