var $ = require('cheerio');
var Q = require('q');
var _ = require('underscore');

var DATA_DIR = './data/info/';
var DB_DIR = './data/lequipe/db/';
var Utils = require('./fetch-utils');

var nameMappingFile = './data/info/stades-names-mapping-lequipe-wikipedia.csv';
var nameIndexFile = './data/info/stades-names-mapping-lequipe-wikipedia.json';

var equipeSourceFile = './data/lequipe/lequipe_hack_cm_matchs.csv';
var equipeTargetFile = DB_DIR + 'lequipe_hack_cm_matchs.json';

var wikipediaSourceFile = DATA_DIR + 'stades.json';
var wikipediaTargetFile = DB_DIR + 'stades.json';

Q().then(function() {
    return Q.all([ Utils.checkDir(DB_DIR), Utils.checkDir(DATA_DIR) ]);
}).then(function() {
    return buildStadeIds(nameMappingFile, nameIndexFile);
}).then(
        function(index) {
            return Q.all([
                    writeEquipeMatchInfoDB(index, equipeSourceFile,
                            equipeTargetFile),
                    writeWikipediaStadeInfoDB(index, wikipediaSourceFile,
                            wikipediaTargetFile) ]);
        }).then(function() {
    console.log('Done.')
}).done();

/* -------------------------------- */

function writeWikipediaStadeInfoDB(index, sourceFile, targetFile) {
    function getStadeKey(obj) {
        var props = obj.properties;
        return toKey([ props.matchYear, props.stadeInfo['Adresse'], props.title ]);
    }
    console.log('Loading data from file: "' + sourceFile + '"...');
    return Utils.readJson(sourceFile).then(function(list) {
        console.log('Done.');
        _.each(list, function(obj) {
            var key = getStadeKey(obj);
            var stadeId = index.wikipediaStadeIndex[key];
            console.log(key, '' + stadeId)
            obj.properties.stadeId = stadeId;
        })
        console.log('Writing data to file: "' + targetFile + '"...');
        return Utils.writeJson(targetFile, list).then(function() {
            console.log('Done.');
            return list;
        });
    });
}

function writeEquipeMatchInfoDB(index, sourceFile, targetFile) {
    function getStadeKey(obj) {
        return toKey([ obj.saison, obj.lieu_du_match, obj.stade ]);
    }
    var list = [];
    console.log("Extracting data from l'Equipe DB ('" + sourceFile + "')...");
    return Utils.readCsv(sourceFile, function(obj) {
        var key = getStadeKey(obj);
        var stadeId = index.equipeStadeIndex[key];
        obj.stadeId = stadeId;
        obj.type = 'Match';
        list.push({
            type : 'Feature',
            properties : obj
        })
    }, {
        delim : ';'
    }).then(function() {
        console.log('Done.');
        console.log("Writing data to l'Equipe DB ('" + targetFile + "')...");
        return Utils.writeJson(targetFile, list).then(function() {
            console.log('Done.');
        });
    });
}

function toKey(array) {
    return array.join('-');
}

function buildStadeIds(from) {
    function getEquipeStadeKey(obj) {
        return toKey([ obj.eqseason, obj.eqplace, obj.eqstade ]);
    }
    function getWikipediaStadeKey(obj) {
        return toKey([ obj.wpseason, obj.wpplace, obj.wpstade ]);
    }
    var equipeStadeIndex = {};
    var wikipediaStadeIndex = {};
    var idx = {};
    var results = {
        idx : idx,
        equipeStadeIndex : equipeStadeIndex,
        wikipediaStadeIndex : wikipediaStadeIndex,
    };
    console.log("Extracting name mapping...")
    return Utils.readCsv(from, function(obj) {
        console.log(obj);
        obj.stadeId = _.uniqueId('stade-');
        results.idx[obj.stadeId] = obj;
        results.wikipediaStadeIndex[getWikipediaStadeKey(obj)] = obj.stadeId;
        results.equipeStadeIndex[getEquipeStadeKey(obj)] = obj.stadeId;
    }, {
        delim : ','
    }).then(function() {
        console.log('Done.');
        return results;
    })
}

function extractWikipediaStadeNames(from, to) {
    function getStadeKey(obj) {
        var props = obj.properties;
        return props.matchYear + ';' + props.title + ';'
                + props.stadeInfo['Adresse'];
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
