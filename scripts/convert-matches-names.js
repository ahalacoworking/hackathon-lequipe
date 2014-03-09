var $ = require('cheerio');
var Q = require('q');
var _ = require('underscore');

var DATA_DIR = './data/info/';
var TMP_DIR = './data/tmp/';
var Utils = require('./fetch-utils');

var equipeSourceFile = './data/lequipe/lequipe_hack_cm_matchs.csv';
var equipeResultFile = DATA_DIR + 'stades-names-lequipe.csv';

var wikipediaSourceFile = DATA_DIR + 'stades.json';
var wikipediaResultFile = DATA_DIR + 'stades-names-wikipedia.csv';

/* -------------------------------- */s

function toKey(array) {
    return array.join('-');
}

function extractEquipeStadeNames(from, to) {
    function getStadeKey(obj) {
        return toKey([ obj.saison, obj.lieu_du_match, obj.stade ]);
    }
    var results = {};
    console.log("Extracting data from l'Equipe DB...")
    return Utils.readCsv(from, function(obj) {
        var str = getStadeKey(obj);
        results[str] = '';
    }, {
        delim : ';'
    }).then(function() {
        var array = _.keys(results).sort();
        return array.join('\n');
    }).then(function(info) {
        console.log('Writing data in file: "' + to + '"...');
        return Utils.writeText(to, info).then(function() {
            console.log('Done.');
        });
    });
}

function extractWikipediaStadeNames(from, to) {
    function getStadeKey(obj) {
        var props = obj.properties;
        return toKey([ props.matchYear, props.stadeInfo['Adresse'], props.title ]);
    }
    var results = {};
    console.log("Extracting data from Wikipedia DB...")
    return Utils.readJson(from).then(function(data) {
        _.each(data, function(obj) {
            var key = getStadeKey(obj);
            results[key] = '';
        });
        var array = _.keys(results).sort();
        return array.join('\n');
    }).then(function(info) {
        console.log('Writing data in file: "' + to + '"...');
        return Utils.writeText(to, info).then(function() {
            console.log('Done.');
        });
    });
}

Q().then(function() {
    return Q.all([ Utils.checkDir(TMP_DIR), Utils.checkDir(DATA_DIR) ]);
}).then(function() {
    return extractEquipeStadeNames(equipeSourceFile, equipeResultFile);
}).then(
        function() {
            return extractWikipediaStadeNames(wikipediaSourceFile,
                    wikipediaResultFile);
        }).then(function(result) {
    console.log('OK');
    return result;
}).done();
