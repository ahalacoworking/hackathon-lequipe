var _ = require('underscore');
var MosaicDistil = require('mosaic-distil');
var Utils = require('mosaic-distil/transform-utils');
var Q = require('q');
var Geocoder = require('geocoder');
var dataFolder = '../data';

var listener = new MosaicDistil.WriteListener({
    dataFolder : dataFolder
});
listener = new MosaicDistil.LogListener({
    listener : listener,
});

var dataSets = [];

// communautés des pays
dataSets.push(D01_CommunautesDesPays());

var dataProvider = new MosaicDistil.CsvDataProvider({
    dataSets : dataSets,
    dataFolder : dataFolder,
    forceDownload : true
})
return dataProvider.handleAll(listener).fail(function(err) {
    console.log(' * >>> ', err.stack);
}).done();

// Common properties:
// - type
// - label
// - url
// - tel
// - fax

/* ------------------------------------------------------------ */

function D01_CommunautesDesPays() {
    return Utils.newDataSet({
        "path" : "communautes/Fichier communautés pour Sirétisation.csv",
        csvOptions : {
            delim : ','
        },
        transform : function(obj) {
            return {
                type : 'Feature',
                properties : _.extend({
                    type : 'Communutés'
                }, this._toProperties(obj, {
                    convert : {
                        'Nom' : 'label',
                        'Site internet' : 'url'
                    },
                    dataTypes : {
                        'Site internet' : 'url'
                    }
                })),
                geometry : undefined, // this._toGeometryPoint(obj.wgs84)
            }
        }
    });
}

/* ------------------------------------------------------------ */

