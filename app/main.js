(function(define) {

    require([ './require.config' ], function() {
        require([ 'underscore', 'jquery', 'q', 'Mosaic', 'L',
                "text!./main.template.html", 'bootstrap' ], module);
    });

    function module(_, $, Q, Mosaic, L, templateHtml) {

        var adapterManager = Mosaic.AdapterManager.getInstance();

        Mosaic.registerViewAdapters(templateHtml);
        Mosaic.registerMapOptions(templateHtml);
        var template = $(templateHtml);

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
            maxZoom : 22,
            initialZoom : 2,
            initialCenter : [ -33.046875, 43.83452678223684 ]
        })
        var list = new Mosaic.ListView({
            app : app,
            el : $('#years')
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

        // - Get the list of matchs
        // - Show a list of

        var StadePopupView = Mosaic.ViewAdapter.extend({
            type : 'StadePopupView'
        })

        var stadesFileUrl = '../data/lequipe/db/stades.json';
        var coupsDuMondeFileUrl = '../data/info/coupsDuMondeInfo.json';
        var matchFileUrl = '../data/lequipe/db/lequipe_hack_cm_matchs.json';

        var stadesDataSet;
        var coupsDuMondeDataSet;

        app.addDataSet(new Mosaic.TilesDataSet({
            tilesUrl : tilesUrl,
        }));
        app.addDataSet(new Mosaic.DebugDataSet());
        Q().then(function() {
            return loadJson(stadesFileUrl).then(function(data) {
                stadesDataSet = new Mosaic.GeoJsonDataSet({
                    data : data
                });
                app.addDataSet(stadesDataSet);
            })
        }).then(function() {
            return loadJson(coupsDuMondeFileUrl).then(function(data) {
                coupsDuMondeDataSet = new Mosaic.GeoJsonDataSet({
                    data : data
                });
                app.addDataSet(coupsDuMondeDataSet);
            })
        }).then(
                function() {
                    stadesDataSet.on('activateResource', function(ev) {
                        console.log('Stade is activated', ev);
                    });
                    coupsDuMondeDataSet.on('activateResource', function(ev) {
                        var options = {};
                        var resource = ev.resource;
                        var ViewType = coupsDuMondeDataSet.getResourceAdapter(
                                resource, StadePopupView);
                        var view = new ViewType({
                            resource : resource,
                            dataSet : coupsDuMondeDataSet
                        });

                        var element = view.getElement();
                        element.modal(options);
                        
                        $('body').append(element);
                        view.render();

                    });
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
