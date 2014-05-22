var Utils = require('../common-styles');
var _ = require('underscore');
var Styles = require('tilepin/tilepin-styles');

// Levels:
// * 3 - 10 - "Territoire/niv2"
// * 10 - 11 - both types levels "Territoire/niv2" + "Territoire/niv1"
// * 12 - 20 - "Territoire/niv1"

// "Territoire/niv2"
// * zoom: 3 - 11
// * text: 24 at the level 11
// * transparency:

// "Territoire/niv1"
// * zoom: 10 - 18
// * text: 24 at the level 18
// * transparency:

var style = Styles({
    'polygon-fill' : 'white',
    'polygon-opacity' : 0,

    'line-width' : 0,
    'line-opacity' : 0,

    '[type="Territoire/niv2"]' : Styles({
        'polygon-fill' : '@polygon_color_niv2',
    }).range(3, 11, Styles.linear(1, 0.2, function(zoom, opacity) {
        // Set opacity (1 -> 0)
        var obj = {};
        obj['[zoom>=' + zoom + ']'] = {
            'polygon-opacity' : opacity
        }
        return obj;
    })).add({
        '[zoom>=12]' : {
            'polygon-opacity' : 0
        }
    }).get(),

    '[type="Territoire/niv1"]' : Styles({
        'polygon-fill' : '@polygon_color_niv1',
    }).range(10, 15, Styles.linear(0.5, 1, function(zoom, opacity) {
        // Set parameter for zoom levels 3-11
        // Set opacity (1 -> 0)
        var obj = {};
        obj['[zoom>=' + zoom + ']'] = {
            'polygon-opacity' : opacity
        }
        return obj;
    })).get(),

    '::label' : {
        'text-name' : '[label]',
        'text-allow-overlap' : true,
        'text-face-name' : '"Open Sans Regular"',
        'text-opacity' : 0,
        '[type="Territoire/niv2"]' : Styles({
            'text-opacity' : 0,
            'text-fill' : '@text_color_niv2',
        }).range(8, 11, Styles.exp(0.5, function(zoom, size) {
            // Set text size
            var obj = {};
            obj['[zoom>=' + zoom + ']'] = {
                'text-size' : '@text_size_niv2 * ' + size
            }
            return obj;
        }), Styles.linear(1, .5, function(zoom, val) {
            var obj = {};
            obj['[zoom>=' + zoom + ']'] = {
                'text-opacity' : val
            }
            return obj;
        })).add({
            '[zoom>=12]' : {
                'text-opacity' : 0
            }
        }).get(),

        '[type="Territoire/niv1"]' : Styles({
            'text-opacity' : 0,
        }).range(10, 12, Styles.exp(0.6, function(zoom, size) {
            // Set text size
            var obj = {};
            obj['[zoom>=' + zoom + ']'] = {
                'text-size' : '@text_size_niv1 * ' + size
            }
            return obj;
        }), Styles.linear(0, 20, function(zoom, val) {
            // Set text darken(0% -> 20%)
            var obj = {};
            obj['[zoom>=' + zoom + ']'] = {
                'text-fill' : 'darken(@text_color_niv1, ' + val + '%)',
                'text-opacity' : 0.8 + val / 100
            }
            return obj;
        })).get()
    }

})
// Get the final style
.get();

console.log('-------')
console.log(JSON.stringify(style, null, 2));

module.exports = {
    'Map' : {
        'font-directory' : 'url(../../../fonts)',
        'buffer-size' : 512
    },
    '@text_color_niv1' : '16',
    '@text_size_niv1' : '24',
    '@text_size_niv2' : '36',
    '@polygon_color_niv1' : '#A4E3FF',
    '@polygon_color_niv2' : '#A4E3FF',
    '@text_color_niv1' : 'darken(@polygon_color_niv1, 50%)',
    '@text_color_niv2' : 'darken(@polygon_color_niv2, 50%)',
    '.objects' : style
}