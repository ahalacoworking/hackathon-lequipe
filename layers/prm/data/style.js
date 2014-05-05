var Utils = require('../common-styles');
var _ = require('underscore');

var visiter = [ 'Monument', 'Museum', 'Hotels' ];

var maxZoom = 12;
var size = 24;
var opacity = 0.8;
var zoomLevels = Utils.getMarkerZoomLevels({
    'marker-width' : size,
    'marker-opacity' : opacity,
    'marker-line-width' : 1,
    'marker-line-opacity' : opacity
}, {
    maxZoom : maxZoom
});

var style = Utils.extendStyle({
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
    'marker-line-color' : 'white',
}, zoomLevels, {
    'marker-fill' : 'silver',
});

module.exports = {
    '.objects' : Utils.extendStyle(style, {}),
    '.objects[type="museum"]' : {
        'marker-fill' : 'red'
    }
}