var Utils = require('../common-styles');
var _ = require('underscore');

var style = {
    'polygon-fill' : 'white',
    'line-width' : 0,
    'polygon-opacity' : 0,
    'line-opacity' : 0,
    '[type="Territoire/niv2"]' : {
        'polygon-fill' : '#A4E3FF',
        'polygon-opacity' : 0.8,
        '[zoom>=9]' : {
            'polygon-opacity' : '0.67 * @text_size_niv2'
        },
        '[zoom>=10]' : {
            'polygon-opacity' : '0.53 * @text_size_niv2'
        },
        '[zoom>=11]' : {
            'polygon-opacity' : '0.4 * @text_size_niv2'
        },
        '[zoom>=12]' : {
            'polygon-opacity' : '0.27 * @text_size_niv2'
        },
        '[zoom>=13]' : {
            'polygon-opacity' : '0 * @text_size_niv2'
        }
    },
    '[type="Territoire/niv1"]' : {
        'polygon-fill' : '#1CB6FF',
        'polygon-opacity' : 0,
        '[zoom>=9]' : {
            'polygon-opacity' : '0.27 * @text_size_niv1',
        },
        '[zoom>=10]' : {
            'polygon-opacity' : '0.4 * @text_size_niv1'
        },
        '[zoom>=11]' : {
            'polygon-opacity' : '0.53 * @text_size_niv1'
        },
        '[zoom>=12]' : {
            'polygon-opacity' : '0.67 * @text_size_niv1'
        },
        '[zoom>=13]' : {
            'polygon-opacity' : '0.8 * @text_size_niv1'
        }
    },
    '::labels' : {
        'text-size' : 10,
        'text-name' : '[label]',
        'text-face-name' : '"Open Sans Regular"',
        // 'text-halo-fill' : 'fadeout(white, 30%)',
        'text-halo-radius' : 15,
        'text-fill' : 'red',
        '[type="Territoire/niv2"]' : {
            '[zoom<=8]' : {
                'text-size' : 16,
            },
            '[zoom>=9]' : {
                'text-size' : 15.4,
            },
            '[zoom>=10]' : {
                'text-size' : 14.8,
            },
            '[zoom>=11]' : {
                'text-size' : 14.2,
            },
            '[zoom>=12]' : {
                'text-size' : 13.6,
            }
        },
        '[type="Territoire/niv1"]' : {
            '[zoom>10]' : {
                'text-size' : 14,
            },
            '[zoom>=11]' : {
                'text-size' : 16,
            },
            '[zoom>=12]' : {
                'text-size' : 18,
            },
            '[zoom>=13]' : {
                'text-size' : 20,
            },
            '[zoom>13]' : {
                'text-size' : 15,
            }
        },
    },
}

console.log(style);

module.exports = {
    'Map' : {
        'font-directory' : 'url(../../fonts)',
        'buffer-size' : 256
    },
    '@text_size_niv1' : '16',
    '@text_size_niv2' : '24',
    '.objects' : style
}