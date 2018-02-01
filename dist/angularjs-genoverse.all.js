(function() {

    function urlencodeSpecies() {
        /**
         * Replaces whitespaces with underscores in input string (assumed to be a scientific name of species)
         * and converts it to lower case.
         *
         * @param input (string} - capitalized scientific name of a species with whitespaces, e.g. Homo sapiens
         * @returns {string} - scientific name of species with whitespaces replaces with underscores
         */
        return function(input) {
            if (input) {
                input = input.replace(/ /g, '_').toLowerCase();

                // Canis familiaris is a special case
                if (input == 'canis_familiaris' || input == 'canis_lupus_familiaris') {
                    input = 'canis_lupus_familiaris';
                } else if (input == 'gorilla_gorilla' || input == 'gorilla_gorilla_gorilla') {
                    input = 'gorilla_gorilla_gorilla';
                } else if (input == 'ceratotherium_simum' || input == 'ceratotherium_simum_simum') {
                    input = 'ceratotherium_simum_simum';
                } else if (input == 'dictyostelium_discoideum' || input == 'dictyostelium_discoideum_ax4') {
                    input = 'dictyostelium_discoideum';
                }
            }

            return input;
        }
    }
    urlencodeSpecies.$inject = [];

    function urldecodeSpecies() {
        /**
         * Replaces underscores with whitespaces in input string and capitalizes the first letter in it.
         *
         * @param input {string} - scientific name of a species in lower case with '_', e.g. homo_sapiens
         * @returns {string} - capitalized scientific name of a species with whitespaces, e.g. Homo sapiens
         */
        return function(input) {
            if (input) {
                input = input.replace(/_/g, ' ');
                input = input.charAt(0).toUpperCase() + input.slice(1);

                if (input == 'Canis familiaris' || input == 'Canis lupus familiaris') {
                    input = 'Canis familiaris';
                } else if (input == 'Gorilla gorilla' || input == 'Gorilla gorilla gorilla') {
                    input = 'Gorilla gorilla'
                } else if (input == 'Ceratotherium simum' || input == 'Ceratotherium simum simum') {
                    input = 'Ceratotherium simum'
                } else if (input == 'Dictyostelium discoideum' || input == 'Dictyostelium discoideum ax4') {
                    input = 'Dictyostelium discoideum ax4';
                }
            }

            return input;
        }
    }
    urldecodeSpecies.$inject = [];

    function chrToUCSC() {
        /**
         * UCSC nomencalture for chromosomes is slightly different from Ensembl. This is a converter.
         *
         * @param input {string} Ensembl-style chromosome name, e.g. '21', 'X', 'M' or 'D38368'
         * @returns {string} 'chr21', 'chrX', 'chrY' or 'D38368'
         */
        return function(input) {
            return 'chr' + input.toString();
        }
    }
    chrToUCSC.$inject = [];

    function genoverse($filter, $timeout) {
        /**
         * Returns the directive definition object for genoverse directive.
         */
        return {
            restrict: 'E',
            scope: {
                // TODO in 2.0.0: assembly:         '=',
                genome:           '=',
                chr:              '=',
                chromosomeSize:   '=?',
                start:            '=',
                end:              '=',

                exampleLocations: '=?', // our addition, allows to switch species

                highlights:       '=?',
                plugins:          '=?',

                urlParamTemplate: '=?',
                useHash:          '=?',

                dragAction:       '=?',
                wheelAction:      '=?',
                isStatic:         '=?',

                saveable:         '=?',
                storageType:      '=?',
                saveKey:          '=?',

                autoHideMessages: '=?',
                trackAutoHeight:  '=?',
                hideEmptyTracks:  '=?'
            },
            template:
                "<div class='wrap genoverse-wrap'>" +
                "  <div id='genoverse'></div>" +
                "  <div id='for-tracks'></div>" +
                "</div>",
            transclude: true,
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                var ctrl = this;

                // Variables
                // ---------
                ctrl.trackConfigs = [];

                // Methods
                // -------
                ctrl.render = function() {
                    // create Genoverse browser
                    var genoverseConfig = ctrl.parseConfig();
                    $scope.browser = new Genoverse(genoverseConfig);

                    // set browser -> Angular data flow
                    $scope.browser.on({
                        afterInit: function() { // when genoverse is already initialized, attach watches to it
                            // set Genoverse -> Angular data flow
                            $scope.genoverseToAngularWatches = ctrl.setGenoverseToAngularWatches();

                            // set Angular -> Genoverse data flow
                            $scope.angularToGenoverseWatches = ctrl.setAngularToGenoverseWatches();

                            $timeout(angular.noop);
                        },

                        // this event is called, whenever the user updates the browser viewport location
                        afterSetRange: function () {
                            // let angular update its model in response to coordinates change
                            // that's an anti-pattern, but no other way to use FRP in angular
                            $timeout(angular.noop);
                        }
                    });
                };


                /**
                 * Parses $scope variables and applies defaults, where necessary, constructing genoverseConfig
                 * @returns {Object} - config, suitable for calling new Genoverse(genoverseConfig);
                 */
                ctrl.parseConfig = function() {
                    // Required + hard-coded
                    // ---------------------
                    var genoverseConfig = {
                        container: $element.find('#genoverse'),
                        width: $element.find('#genoverse').width(),

                        chr: $scope.chr,
                        start: $scope.start,
                        end: $scope.end,
                        genome: $filter('urlencodeSpecies')($scope.genome),
                    };

                    // What is displayed
                    // -----------------

                    var tracks = [ Genoverse.Track.Scalebar ];
                    ctrl.trackConfigs.forEach(function(trackConfig) {
                        tracks.push(ctrl.parseTrackConfig(trackConfig));
                    });
                    genoverseConfig.tracks = tracks;

                    if ($scope.highlights !== undefined)       genoverseConfig.highlights = $scope.highlights;
                    if ($scope.plugins !== undefined)          genoverseConfig.plugins = $scope.plugins;
                    else genoverseConfig.plugins = ['controlPanel', 'karyotype', 'resizer', 'fileDrop'];

                    // Interaction with URL
                    // --------------------

                    genoverseConfig.urlParamTemplate = $scope.urlParamTemplate !== undefined ? $scope.urlParamTemplate : false;
                    if ($scope.useHash !== undefined)          genoverseConfig.useHash = $scope.useHash;

                    // User actions
                    // ------------
                    if ($scope.dragAction !== undefined)       genoverseConfig.dragAction = $scope.dragAction;
                    if ($scope.wheelAction !== undefined)      genoverseConfig.wheelAction = $scope.wheelAction;
                    if ($scope.isStatic !== undefined)         genoverseConfig.isStatic = $scope.isStatic;

                    // Saving user configuration
                    // -------------------------
                    if ($scope.saveable !== undefined)         genoverseConfig.saveable = $scope.saveable;
                    if ($scope.storageType !== undefined)      genoverseConfig.storageType = $scope.storageType;
                    if ($scope.saveKey !== undefined)          genoverseConfig.saveKey = $scope.saveKey;

                    // Default track display settings
                    // ------------------------------
                    if ($scope.autoHideMessages !== undefined) genoverseConfig.autoHideMessages = $scope.autoHideMessages;
                    if ($scope.trackAutoHeight !== undefined)  genoverseConfig.trackAutoHeight = $scope.trackAutoHeight;
                    if ($scope.hideEmptyTracks !== undefined)  genoverseConfig.hideEmptyTracks = $scope.hideEmptyTracks;

                    return genoverseConfig;
                };

                /**
                 * A function to be called by nested genoverseTrack directives - they should
                 * push their configs into the list of controller's trackConfigs.
                 *
                 * @param trackConfig - object in our internal trackConfig format
                 */
                ctrl.pushTrackConfig = function(trackConfig) {
                    ctrl.trackConfigs.push(trackConfig)
                };

                /**
                 * Creates a Genoverse.Track child (in terms of Base.js) from our internal trackConfig format.
                 * Basically, conversion from our internal format includes:
                 *  - check, if url is a function - then call it
                 *  - apply '-extra' options
                 *
                 * @param trackConfig - our internal trackConfig format
                 * @returns {Genoverse.Track}
                 */
                ctrl.parseTrackConfig = function(trackConfig) {
                    var parsedConfig = angular.element.extend({}, trackConfig); // clone trackConfig

                    // parse model-related part of trackConfig
                    var modelConfig = {};

                    // parse url
                    modelConfig.url = typeof parsedConfig.url === 'function' ? parsedConfig.url() : parsedConfig.url;
                    delete parsedConfig.url;

                    if (parsedConfig.modelExtra) {
                        angular.element.extend(modelConfig, trackConfig.modelExtra);
                        delete parsedConfig.modelExtra;
                    }

                    parsedConfig.model = parsedConfig.model.extend(modelConfig);

                    // parse view
                    if (parsedConfig.viewExtra) {
                        parsedConfig.view = parsedConfig.view.extend(viewExtra);
                        delete parsedConfig.viewExtra;
                    }

                    // parse controller
                    if (parsedConfig.controllerExtra) {
                        parsedConfig.controller = parsedConfig.controller.extend(controllerExtra);
                        delete parsedConfig.controllerExtra;
                    }

                    // parse extra
                    if (parsedConfig.extra) {
                        angular.element.extend(parsedConfig, parsedConfig.extra);
                        delete parsedConfig.extra;
                    }

                    return Genoverse.Track.extend(parsedConfig);
                };

                /**
                 * Creates angular watches, observing Genoverse browser.
                 * Upon any changes in Genoverse, these watches will update this directive's scope variables.
                 *
                 * @returns {Array} - watches as functions - call them to unbind them
                 */
                ctrl.setGenoverseToAngularWatches = function() {
                    var chrWatch = $scope.$watch('browser.chr', function(newValue, oldValue) {
                        $scope.chr = newValue;
                    });

                    var startWatch = $scope.$watch('browser.start', function(newValue, oldValue) {
                        $scope.start = newValue;
                    });

                    var endWatch = $scope.$watch('browser.end', function(newValue, oldValue) {
                        $scope.end = newValue;
                    });

                    var chromosomeSizeWatch = $scope.$watch('browser.chromosomeSize', function(newValue, oldValue) {
                        $scope.chromosomeSize = newValue;
                    });

                    return [chrWatch, startWatch, endWatch, chromosomeSizeWatch];
                };

                /**
                 * Creates angular watches, observing directive's scope variables.
                 * Upon any changes to those scope variables, Genoverse browser coordinates will be updated.
                 *
                 * @returns {[*,*,*,*]} - watches as functions - call them to unbind them
                 */
                ctrl.setAngularToGenoverseWatches = function() {
                    var startWatch = $scope.$watch('start', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.moveTo($scope.chr, newValue, $scope.end, true);
                        }
                    });

                    var endWatch = $scope.$watch('end', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.moveTo($scope.chr, $scope.start, newValue, true);
                        }
                    });

                    var chrWatch = $scope.$watch('chr', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.moveTo(newValue, $scope.start, $scope.end, true);
                        }
                    });

                    var speciesWatch = $scope.$watch('genome', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            // destroy the old instance of browser and watches
                            $scope.genoverseToAngularWatches.forEach(function (element) { element(); }); // clear old watches
                            $scope.angularToGenoverseWatches.forEach(function (element) { element(); }); // clear old watches
                            $scope.browser.destroy(); // destroy genoverse and all callbacks and ajax requests
                            delete $scope.browser; // clear old instance of browser

                            // set the default location for the browser
                            if ($scope.exampleLocations[newValue]) {
                                $scope.chr = $scope.exampleLocations[newValue].chr;
                                $scope.start = $scope.exampleLocations[newValue].start;
                                $scope.end = $scope.exampleLocations[newValue].end;
                            } else {
                                alert("Can't find example location for genome ", newValue);
                            }

                            // create a new instance of browser and set the new watches for it
                            ctrl.render();
                        }
                    });

                    var highlightsWatch = $scope.$watch('highlights', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.addHighlights(newValue);
                        }
                    })

                    return [speciesWatch, chrWatch, startWatch, endWatch, highlightsWatch];
                };

                /**
                 * Makes browser "responsive" - if container changes width, so does the browser.
                 */
                ctrl.setGenoverseWidth = function() {
                    // if $scope.container passed, makes browser width responsive
                    var width = $($element.find('.genoverse-wrap')).width();
                    $scope.browser.setWidth(width);

                    // resize might change viewport location - digest these changes
                    $timeout(angular.noop)
                };
            }],
            link: function(scope, $element, attrs, ctrl, transcludeFn) {
                // We are going to temporarily add child directive's template to $element
                // so it can be linked to scope, but after it's linked, we detach it. Taken from:
                // http://stackoverflow.com/questions/23345207/transcluded-content-requires-the-controller-of-the-transcluding-directive
                transcludeFn(function(clone) {
                    $element.find('#for-tracks').append(clone);
                }).detach(); // <- Immediately detach it

                ctrl.render();

                // resize genoverse on browser width changes, if container passed - attach once only
                $(window).on('resize', ctrl.setGenoverseWidth);
            }
        };
    }
    genoverse.$inject = ['$filter', '$timeout'];


    function genoverseTrack() {
        return {
            restrict: 'E',
            require: "^genoverse",
            template: "",
            scope: {
                'model':            '=',
                'modelExtra':       '=?',
                'view':             '=',
                'viewExtra':        '=?',
                'controller':       '=?',
                'controllerExtra':  '=?',
                'extra':            '=?',

                'name':             '=',
                'height':           '=?',
                'resizable':        '=?',
                'autoHeight':       '=?',
                'hideEmpty':        '=?',
                'margin':           '=?',
                'border':           '=?',
                'unsortable':       '=?',

                'url':              '=',
                'urlParams':        '=?',
                'data':             '=?',
                'allData':          '=?',
                'dataRequestLimit': '=?',
                'dataType':         '=?',
                'xhrFields':        '=?',

                'featureHeight':    '=?',
                'featureMargin':    '=?',
                'color':            '=?',
                'fontColor':        '=?',
                'fontWeight':       '=?',
                'fontHeight':       '=?',
                'fontFamily':       '=?',
                'labels':           '=?',
                'repeatLabel':      '=?',
                'bump':             '=?',
                'depth':            '=?',
                'threshold':        '=?',

                'clickTolerance':   '=?',

                'id':               '=?' // TODO: remove this in 2.0.0
            },
            link: function(scope, element, attrs, genoverseCtrl) {
                var trackConfig = {};

                // MVC-related settings and extras
                // -------------------------------

                trackConfig.model          = scope.model;
                trackConfig.view           = scope.view;
                if (scope.controller)      trackConfig.controller = scope.controller;

                if (scope.modelExtra)      trackConfig.modelExtra = scope.modelExtra;
                if (scope.viewExtra)       trackConfig.viewExtra = scope.viewExtra;
                if (scope.controllerExtra) trackConfig.controllerExtra = scope.controllerExtra;

                if (scope.extra)           trackConfig.extra = scope.extra;

                // Display, resizing and reordering
                // --------------------------------

                trackConfig.name             = scope.name;
                trackConfig.height           = scope.height !== undefined           ? scope.height           : 12;
                trackConfig.resizable        = scope.resizable !== undefined        ? scope.resizable        : true;
                trackConfig.autoHeight       = scope.autoHeight !== undefined       ? scope.autoHeight       : undefined;
                trackConfig.hideEmpty        = scope.hideEmpty !== undefined        ? scope.hideEmpty        : undefined;
                trackConfig.margin           = scope.margin !== undefined           ? scope.margin           : 2;
                trackConfig.border           = scope.border !== undefined           ? scope.border           : true;
                trackConfig.unsortable       = scope.unsortable !== undefined       ? scope.unsortable       : false;

                // Fetching data
                // -------------

                trackConfig.url              = scope.url;
                trackConfig.urlParams        = scope.urlParams !== undefined        ? scope.urlParams        : undefined;
                trackConfig.data             = scope.data !== undefined             ? scope.data             : undefined;
                trackConfig.allData          = scope.allData !== undefined          ? scope.allData          : false;
                trackConfig.dataRequestLimit = scope.dataRequestLimit !== undefined ? scope.dataRequestLimit : undefined;
                trackConfig.dataType         = scope.dataType !== undefined         ? scope.dataType         : undefined; // in original Genoverse it is "json", but this breaks Sequence track;
                trackConfig.xhrFields        = scope.xhrFields !== undefined        ? scope.xhrFields        : undefined;

                // Drawing features
                // ----------------

                trackConfig.featureHeight    = scope.featureHeight !== undefined    ? scope.featureHeight    : undefined;
                trackConfig.featureMargin    = scope.featureMargin !== undefined    ? scope.featureMargin    : { top: 3, right: 1, bottom: 1, left: 0 };
                trackConfig.color            = scope.color !== undefined            ? scope.color            : "#000000";
                trackConfig.fontColor        = scope.fontColor !== undefined        ? scope.fontColor        : undefined;
                trackConfig.fontWeight       = scope.fontWeight !== undefined       ? scope.fontWeight       : "normal";
                trackConfig.fontHeight       = scope.fontHeight !== undefined       ? scope.fontHeight       : 10;
                trackConfig.fontFamily       = scope.fontFamily !== undefined       ? scope.fontFamily       : "sans-serif";
                trackConfig.labels           = scope.labels !== undefined           ? scope.labels           : true;
                trackConfig.repeatLabels     = scope.repeatLabels !== undefined     ? scope.repeatLabels     : false;
                if (scope.bump != undefined)               trackConfig.bump         = scope.bump;
                trackConfig.depth            = scope.depth !== undefined            ? scope.depth            : undefined;
                if (scope.threshold !== undefined)         trackConfig.threshold    = scope.threshold;

                // Interaction with features
                // -------------------------
                trackConfig.clickTolerance   = scope.clickTolerance !== undefined   ? scope.clickTolerance   : 0;

                // TODO: remove this in 2.0.0
                if (scope.id !== undefined)              trackConfig.id = scope.id;

                genoverseCtrl.pushTrackConfig(trackConfig);
            }
        }
    }
    genoverseTrack.$inject = [];

    angular.module("Genoverse", [])
        .filter("urlencodeSpecies", urlencodeSpecies)
        .filter("urldecodeSpecies", urldecodeSpecies)
        .filter("chrToUCSC", chrToUCSC)
        .directive("genoverse", genoverse)
        .directive("genoverseTrack", genoverseTrack);
})();
