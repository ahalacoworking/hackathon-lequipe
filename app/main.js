(function(define) {

    require([ './require.config' ], function() {
        require([ 'underscore', 'jquery', 'q', 'Mosaic', 'L',
                "text!./main.template.html", 'bootstrap' ], module);
    });

    function module(_, $, Q, Mosaic, L, templateHtml) {

        var adapterManager = Mosaic.AdapterManager.getInstance();
        Mosaic.registerViewAdapters(templateHtml);
        Mosaic.registerMapOptions(templateHtml);

        /* ------------------------------------------------- */
        Mosaic.DebugDataSet = Mosaic.DataSet.extend({});
        adapterManager.registerAdapter(Mosaic.MapView, Mosaic.DebugDataSet,
                Mosaic.ViewAdapter.extend({
                    render : function(view, data) {
                        var map = view.getMap();
                        map.on('click', function(e) {
                            console.log(map.getZoom(), '[' + e.latlng.lng + ','
                                    + e.latlng.lat + ']');
                        })
                    }
                }));

        var app = new Mosaic.App();
        var map = new Mosaic.MapView({
            app : app,
            el : $('#map'),
            maxZoom : 16,
            initialZoom : 8,
            initialCenter : [ 2.98038, 48.7361 ]
        })

        var list = new Mosaic.ListView({
            app : app,
            el : $('#list')
        })
        app.start();

        function updateSize() {
            var win = $(window);
            var width = win.width();
            var height = win.height();
            $('.full-height').each(function() {
                var e = $(this);
                var top = e.offset().top;
                e.height(height - top);
            })
        }
        $(window).resize(updateSize);
        $(updateSize);

        var tilesUrl = 'http://127.0.0.1:8888/tiles/app-econovista/osm-bright/{z}/{x}/{y}.png';
        var tilesUrl = "http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png";
        tilesUrl = 'http://{s}.tiles.mapbox.com/v3/mkotelnikov.hfd53c8o/{z}/{x}/{y}.png';
        // tilesUrl =
        // "http://localhost:8888/tiles/app-econovista/osm-bright/{z}/{x}/{y}.png";
        var resourcesUrl = '../data/resources-tic.json';

        app.addDataSet(new Mosaic.TilesDataSet({
            tilesUrl : tilesUrl,
        }));
        app.addDataSet(new Mosaic.DebugDataSet());

        var ticDataSet;

        Q().then(function() {
            return loadJson(resourcesUrl).then(function(data) {
                ticDataSet = new Mosaic.GeoJsonDataSet({
                    data : data
                });
                ticDataSet.clusterPoints = true;
                app.addDataSet(ticDataSet);
            })
        }).then(function() {
            return loadJson(resourcesUrl).then(function(data) {
                ticDataSet = new Mosaic.GeoJsonDataSet({
                    data : data
                });
                app.addDataSet(ticDataSet);
            })
        }).done();

        /**
         * Return a promise for the data loaded from the specified URL
         */
        function loadJson(url) {
            var deferred = Q.defer();
            $.get(url, function(data) {
                deferred.resolve(data);
            }).fail(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
})(typeof define === 'function' ? define : require('amdefine')(module));
