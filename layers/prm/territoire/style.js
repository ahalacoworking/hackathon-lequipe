var Utils = require('../common-styles');
var _ = require('underscore');

function calculateStyles() {
    var opacity = 0.8;
    var niv1 = {
        'polygon-fill' : '#A4E3FF',
        'polygon-opacity' : opacity
    };
    var niv2 = {
        'polygon-fill' : '#1CB6FF',
        'polygon-opacity' : 0
    };

    var labels1 = {}
    var labels2 = {}

    var size1 = 20;
    var size2 = 8;
    var zoomMin = 8;
    var zoomMax = 13;

    var text = {
        'text-name' : '[nomcom]',
        'text-face-name' : '"Open Sans Regular"',
        'text-fill' : '#036',
        'text-halo-fill' : 'fadeout(white, 30%)',
        'text-halo-radius' : 2.5
    }

    labels1['[zoom<=' + zoomMin + ']'] = _.extend({
        'text-size' : size1
    }, text)

    var steps = zoomMax - zoomMin + 1;
    var step = opacity / steps;
    for (var i = 1; i < steps; i++) {
        var delta = i * step;
        var zoom = '[zoom>=' + (i + zoomMin) + ']';
        var o = parseFloat((opacity - delta).toFixed(2));
        niv1[zoom] = {
            'polygon-opacity' : o
        };
        if (o > step) {
            labels1[zoom] = _.extend({
                'text-size' : size1 + i * 0.2
            }, text)
        }

        o = parseFloat(delta.toFixed(2));
        niv2[zoom] = {
            'polygon-opacity' : o
        };
        if (o > step) {
            labels2[zoom] = _.extend({
                'text-size' : size2 + i * 2
            }, text)
        }
    }
    niv1['[zoom>=' + zoomMax + ']'] = {
        'polygon-opacity' : 0
    }
    labels2['[zoom>' + zoomMax + ']'] = _.extend({
        'text-size' : size2 + (zoomMax - zoomMin)
    }, text)
    var style = {
        'polygon-fill' : 'white',
        'line-width' : 0,
        'polygon-opacity' : 0,
        'line-opacity' : 0,
        // 'polygon-smooth' : 1,
        '[niv1=1]' : niv1,
        '[niv2=1]' : niv2,
        '[niv2=1]::labels' : labels2,
        '[niv1=1]::labels' : labels1,
    }
    return style;
}

var style = {
    'polygon-fill' : 'white',
    'line-width' : 0,
    'polygon-opacity' : 0,
    'line-opacity' : 0,
    '[niv1=1]' : {
        'polygon-fill' : '#A4E3FF',
        'polygon-opacity' : 0.8,
        '[zoom>=9]' : {
            'polygon-opacity' : 0.67
        },
        '[zoom>=10]' : {
            'polygon-opacity' : 0.53
        },
        '[zoom>=11]' : {
            'polygon-opacity' : 0.4
        },
        '[zoom>=12]' : {
            'polygon-opacity' : 0.27
        },
        '[zoom>=13]' : {
            'polygon-opacity' : 0
        }
    },
    '[niv2=1]' : {
        'polygon-fill' : '#1CB6FF',
        'polygon-opacity' : 0,
        '[zoom>=9]' : {
            'polygon-opacity' : 0.27
        },
        '[zoom>=10]' : {
            'polygon-opacity' : 0.4
        },
        '[zoom>=11]' : {
            'polygon-opacity' : 0.53
        },
        '[zoom>=12]' : {
            'polygon-opacity' : 0.67
        },
        '[zoom>=13]' : {
            'polygon-opacity' : 0.8
        }
    },
    '[niv1=1]::labels' : {
        '[zoom<=8]' : {
            'text-size' : 16,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=9]' : {
            'text-size' : 15.4,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=10]' : {
            'text-size' : 14.8,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=11]' : {
            'text-size' : 14.2,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=12]' : {
            'text-size' : 13.6,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        }
    },
    '[niv2=1]::labels' : {
        '[zoom>10]' : {
            'text-size' : 14,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=11]' : {
            'text-size' : 16,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=12]' : {
            'text-size' : 18,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>=13]' : {
            'text-size' : 20,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        },
        '[zoom>13]' : {
            'text-size' : 15,
            'text-name' : '[nomcom]',
            'text-face-name' : '"Open Sans Regular"',
            'text-fill' : '#036',
            'text-halo-fill' : 'fadeout(white, 30%)',
            'text-halo-radius' : 2.5
        }
    },
}

// var style = calculateStyles();
// console.log(style);

module.exports = {
    'Map' : {
        'font-directory' : 'url(../../fonts)',
        'buffer-size' : 256
    },
    '.objects' : style
}