require
        .config({
            config : {
                // For cross-domain calls the server should return results
                // with the "Access-Control-Allow-Origin=*" HTTP header field.
                // See also:
                // * http://rockycode.com/blog/cross-domain-requirejs-text/
                text : {
                    useXhr : function(url, protocol, hostname, port) {
                        // allow cross-domain requests
                        // remote server allows CORS
                        return true;
                    }
                }
            },
            paths : {
                'jquery' : './libs/jquery/dist/jquery',
                'text' : './libs/requirejs-text/text',
                'underscore' : './libs/underscore/underscore',
                'bootstrap' : './libs/bootstrap/dist/js/bootstrap',
                'q' : './libs/q/q',

                'Mosaic' : './libs/mosaic-ui/app/Mosaic',
                'leaflet' : './libs/mosaic-ui/app/libs/leaflet/leaflet-src',
                'leaflet.markercluster' : './libs/mosaic-ui/app/libs/leaflet.markercluster/leaflet.markercluster-src',
                'leaflet.loading' : './libs/mosaic-ui/app/libs/leaflet.loading/src/Control.Loading',
                'leaflet.utfgrid' : './libs/mosaic-ui/app/libs/leaflet.utfgrid/leaflet.utfgrid-src',
                'leaflet.geometryutil' : './libs/mosaic-ui/app/libs/leaflet.geometryutil/dist/leaflet.geometryutil',

                'L' : './Leaflet.all'
            },
            shim : {
                'backbone' : {
                    deps : [ 'underscore', 'jquery' ],
                    exports : 'Backbone'
                },
                'bootstrap' : {
                    deps : [ 'jquery' ]
                },
                'jquery' : {
                    exports : 'jquery'
                },
                // 'mosaic-ui' : {
                // deps : [ 'underscore', 'jquery', 'L' ],
                // exports : 'Mosaic'
                // },
                'underscore' : {
                    exports : '_'
                },
                'leaflet' : {
                    exports : 'L'
                },
                'leaflet.markercluster' : {
                    deps : [ 'leaflet' ]
                },
                'leaflet.utfgrid' : {
                    deps : [ 'leaflet' ]
                },
                'leaflet.loading' : {
                    deps : [ 'leaflet' ]
                },
                'leaflet.geometryutil' : {
                    deps : [ 'leaflet' ]
                },
                'L' : {
                    deps : [ 'leaflet', 'leaflet.markercluster',
                            'leaflet.utfgrid', 'leaflet.geometryutil' ]
                },
                'q' : {
                    exports : [ 'q' ]
                }
            }
        });