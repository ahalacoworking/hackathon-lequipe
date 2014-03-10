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
            maxZoom : 16,
            initialZoom : 2,
            initialCenter : [ -33.046875, 43.83452678223684 ]
        })

        var list = new Mosaic.ListView({
            app : app,
            el : $('#years')
        })
        app.start();

        // FIXME: remove it
        var MyControl = L.Control.extend({
            options : {
                position : 'topright'
            },
            onAdd : function(map) {
                var btn = $('<button><i class="fa fa-dribbble"></i></button>');
                btn.click(function() {
                    openMatchPopup();
                })
                return btn[0];
            }
        });
        map.getMap().addControl(new MyControl());
        
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

        // --------------------
        var StadePopupView = Mosaic.ViewAdapter.extend({
            type : 'StadePopupView'
        });

        // --------------------
        var SelectedMatches = Mosaic.GeoJsonDataSet.extend({
            type : 'SelectedMatches',
            getAllSeasonStades : function() {
                var stadeDataSet = this.options.stadeDataSet;
                var matchDataSet = this.options.matchDataSet;
                var year = this.options.year;
                return stadeDataSet.getStadesByIds(matchDataSet
                        .getStadeIdsByYear(year));
            }
        });
        var SelectedMatchesMapAdapter = Mosaic.GeoJsonMapViewAdapter.extend({
            type : 'SelectedMatchesMapAdapter',
            render : function(view, dataSet) {
                Mosaic.GeoJsonMapViewAdapter.prototype.render.apply(this,
                        arguments);
                var resources = dataSet.getAllSeasonStades();
                var points = [];
                _.each(resources, function(resource) {
                    var coords = resource.geometry.coordinates;
                    var point = [ coords[1], coords[0] ];
                    points.push(point);
                });
                var map = view.getMap();
                if (points.length) {
                    var boundingBox = L.latLngBounds(points);
                    map.fitBounds(boundingBox);
                }
            }
        });
        var adapters = Mosaic.AdapterManager.getInstance();
        adapters.registerAdapter(Mosaic.MapView, SelectedMatches,
                SelectedMatchesMapAdapter);

        // --------------------
        var StadeDataSet = Mosaic.GeoJsonDataSet.extend({
            getStadesByIds : function(stadeIds) {
                var results = [];
                _.each(stadeIds, function(stadeId) {
                    var stade = this.getStadeById(stadeId);
                    if (stade) {
                        results.push(stade);
                    }
                }, this);
                return results;
            },
            getStadeById : function(stadeId) {
                var resources = this.getResources();
                var result = null;
                _.each(resources, function(resource) {
                    var id = resource.properties.stadeId;
                    if (stadeId == id) {
                        result = resource;
                    }
                }, this);
                return result;
            }
        });

        var MatchDataSet = Mosaic.GeoJsonDataSet.extend({
            type : 'MatchDataSet',
            loadCountries : function() {
                var result = [];
                var countries = {};
                var list = this.getResources();
                _.each(list, function(resource) {
                    var props = resource.properties;
                    countries[props.equipe1] = countries[props.equipe1] || [];
                    countries[props.equipe2] = countries[props.equipe2] || [];
                    var year = props.saison;
                    countries[props.equipe1].push(year);
                    countries[props.equipe2].push(year);
                })
                return Q(_.keys(countries).sort());
            },
            getStadeIdsByYear : function(year) {
                var resources = this.getResources();
                var results = [];
                _.each(resources, function(resource) {
                    if ('' + resource.properties.saison == year + '') {
                        results.push(resource.properties.stadeId);
                    }
                }, this);
                return results;
            },
            activateMatch : function(matches) {
                this.triggerMethod('activateMatch', {
                    matches : matches
                });
            },
            loadParteners : function(country) {
                var results = {};
                var list = this.getResources();
                _.each(list, function(match) {
                    var props = match.properties;
                    var x;
                    if (props.equipe1 == country) {
                        results[props.equipe2] = x = x || [];
                    }
                    if (props.equipe2 == country) {
                        results[props.equipe1] = x = x || [];
                    }
                    if (x) {
                        x.push(match);
                    }
                })
                return Q(results);
            }
        });

        var stadesFileUrl = '../data/lequipe/db/stades.json';
        var coupsDuMondeFileUrl = '../data/info/coupsDuMondeInfo.json';
        var matchFileUrl = '../data/lequipe/db/lequipe_hack_cm_matchs.json';

        var stadeDataSet;
        var coupsDuMondeDataSet;
        var matchDataSet;

        app.addDataSet(new Mosaic.TilesDataSet({
            tilesUrl : tilesUrl,
        }));
        app.addDataSet(new Mosaic.DebugDataSet());
        Q().then(function() {
            return loadJson(stadesFileUrl).then(function(data) {
                stadeDataSet = new StadeDataSet({
                    data : data
                });
                app.addDataSet(stadeDataSet);
            })
        }).then(function() {
            return loadJson(coupsDuMondeFileUrl).then(function(data) {
                coupsDuMondeDataSet = new Mosaic.GeoJsonDataSet({
                    data : data
                });
                app.addDataSet(coupsDuMondeDataSet);
            })
        }).then(function() {
            return loadJson(matchFileUrl).then(function(data) {
                matchDataSet = new MatchDataSet({
                    data : data
                })
                app.addDataSet(matchDataSet);
            })
        }).then(
                function() {
                    stadeDataSet.on('activateResource', function(ev) {
                        // matchDataSet.activateMatchesByStade();
                        console.log('Stade is activated', ev);
                    });
                    coupsDuMondeDataSet.on('activateResource', function(ev) {
                        console.log('activateResource', ev);
                        // matchDataSet.activateMatchesByCoupsDuMonde();
                        openResourcePopup(coupsDuMondeDataSet, ev.resource,
                                StadePopupView);
                    });
                    openMatchPopup();
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

        var selectedMatches;
        function openMatchPopup() {
            var adapters = Mosaic.AdapterManager.getInstance();
            var ViewType = adapters.getAdapter('MainScreen', 'IntroPopup');
            var view = openPopup(ViewType, {
                dataSet : matchDataSet
            });
            matchDataSet.on('activateMatch', function(event) {
                var element = view.getElement();
                element.modal('hide');
            });

            matchDataSet.on('activateMatch', function(event) {
                if (selectedMatches) {
                    app.removeDataSet(selectedMatches);
                    selectedMatches = null;
                }
                var selectedStades = [];
                var year = null;
                _.each(event.matches, function(match) {
                    var stadeId = match.properties.stadeId;
                    var s = stadeDataSet.getStadeById(stadeId);
                    if (!s || !s.properties)
                        return;
                    var selectedStade = {
                        type : 'Feature',
                        properties : _.clone(s.properties),
                        geometry : _.clone(s.geometry),
                        match : match
                    };
                    selectedStade.properties.type = 'SelectedStade';
                    selectedStades.push(selectedStade);
                    year = match.properties.saison;
                })
                selectedMatches = new SelectedMatches({
                    data : selectedStades,
                    matchDataSet : matchDataSet,
                    stadeDataSet : stadeDataSet,
                    year : year
                });
                app.addDataSet(selectedMatches);
            });
        }

        function openResourcePopup(dataSet, resource, ViewBaseType) {
            var ViewType = dataSet.getResourceAdapter(resource, ViewBaseType);
            return openPopup(ViewType, {
                resource : resource,
                dataSet : dataSet
            });
        }

        function openPopup(ViewType, viewOptions) {
            if (!ViewType)
                return;
            var view = new ViewType(viewOptions);
            var element = view.getElement();
            view.render();
            var options = {};
            element.modal(options);
            $('body').append(element);
            return view;
        }

    }
})(typeof define === 'function' ? define : require('amdefine')(module));
