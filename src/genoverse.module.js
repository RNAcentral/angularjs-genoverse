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
            // Canis familiaris is a special case
            if (input == 'Canis familiaris') {
                input = 'Canis lupus familiaris';
            }
            return input.replace(/ /g, '_').toLowerCase();
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
            if (input == 'canis_lupus_familiaris') {
                input = 'canis_familiaris';
            }
            var output = input.replace(/_/g, ' ');
            output = output.charAt(0).toUpperCase() + output.slice(1);
            return output;
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
            if (input.toString().match(/^\d+$|^[XYM]$/)) {
                return 'chr' + input.toString();
            } else {
                return input.toString();
            }
        }
    }
    chrToUCSC.$inject = [];

    function genoverse($filter, $timeout) {
        /**
         * Returns the directive definition object for genoverse directive.
         * It is meant to be used as follows:
         *
         * <genoverse genome={} chromosome="X" start="1" stop="1000000">
         *     <genoverse-track id="" name="Sequence" info="" label="true"
         *      url-template="{{protocol}}//{{endpoint}}/overlap/region/{{species}}/{{chromosome}}:{{start}}-{{end}}?feature=gene;content-type=application/json"
         *      url-variables="{protocol: 'https', endpoint: 'rest.ensembl.org'">
         *     </genoverse-track>
         * </genoverse>
         */
        return {
            restrict: 'E',
            scope: {
                genome: '=',
                chromosome: '=',
                start: '=',
                end: '=',
                tracks: '='
            },
            template:
                "<div class='wrap genoverse-wrap'>" +
                "    <p class='text-muted'>" +
                "        <span id='genomic-location' class='margin-right-5px'></span>" +
                "        View in <a href='http://{{domain}}/{{genome.species | urlencodeSpecies}}/Location/View?r={{chromosome}}:{{start}}-{{end}}' id='ensembl-link' target='_blank'>Ensembl</a>" +
                "        <span ng-show='genome.assembly_ucsc' class='ucsc-link'>|" +
                "            <a href='http://genome.ucsc.edu/cgi-bin/hgTracks?db={{genome.assembly_ucsc}}&position={{chromosome | chrToUCSC}}%3A{{start}}-{{end}}' target='_blank'>UCSC</a>" +
                "        </span>" +
                "    </p>" +
                "<div id='genoverse'></div>" +
                "<div id='for-tracks'></div>" +
                "</div>",
            transclude: true,
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                var ctrl = this;
                ctrl.trackConfigs = [];

                // Functions and methods
                // ---------------------
                ctrl.render = function() {
                    // generate (updated) Genoverse config
                    var tracks = [ Genoverse.Track.Scalebar ];
                    ctrl.trackConfigs.forEach(function(trackConfig) {
                        // Elements of $scope.tracks are functions. They result in new track configs with updated urls.
                        tracks.push(ctrl.parseTrackConfig(trackConfig));
                    });

                    var genoverseConfig = {
                        container: $element.find('#genoverse'),
                        width: $('.container').width(),
                        // if we want Genoverse itself to update url on scroll, say:
                        urlParamTemplate: false, // or set to: "chromosome=__CHR__&start=__START__&end=__END__",
                        chr: $scope.chromosome,
                        start: $scope.start,
                        end: $scope.end,
                        species: $scope.genome.species,
                        genome: $filter('urlencodeSpecies')($scope.genome.species),
                        plugins: ['controlPanel', 'karyotype', 'resizer', 'fileDrop'],
                        tracks: tracks
                    };

                    // get domain for Ensembl links
                    $scope.domain = getEnsemblSubdomainByDivision($scope.genome);

                    // create Genoverse browser
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

                ctrl.pushTrackConfig = function(trackConfig) {
                    ctrl.trackConfigs.push(trackConfig)
                };

                ctrl.parseTrackConfig = function(trackConfig) {
                    console.log("parseTrackConfig trackConfig = ", trackConfig);
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

                ctrl.setGenoverseToAngularWatches = function() {
                    var speciesWatch = $scope.$watch('browser.species', function(newValue, oldValue) {
                        $scope.genome = getGenomeByName(newValue);
                        $scope.domain = getEnsemblSubdomainByDivision($scope.genome);
                    });

                    var chrWatch = $scope.$watch('browser.chr', function(newValue, oldValue) {
                        $scope.chromosome = newValue;
                    });

                    var startWatch = $scope.$watch('browser.start', function(newValue, oldValue) {
                        $scope.start = newValue;
                    });

                    var endWatch = $scope.$watch('browser.end', function(newValue, oldValue) {
                        $scope.end = newValue;
                    });

                    return [speciesWatch, chrWatch, startWatch, endWatch];
                };

                ctrl.setAngularToGenoverseWatches = function() {
                    var startWatch = $scope.$watch('start', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.moveTo($scope.chromosome, newValue, $scope.end, true);
                        }
                    });

                    var endWatch = $scope.$watch('end', function(newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.browser.moveTo($scope.chromosome, $scope.start, newValue, true);
                        }
                    });

                    var chrWatch = $scope.$watch('chromosome', function(newValue, oldValue) {
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
                            $scope.chromosome = newValue.example_location.chromosome;
                            $scope.start = newValue.example_location.start;
                            $scope.end = newValue.example_location.end;

                            // create a new instance of browser and set the new watches for it
                            ctrl.render();
                        }
                    });

                    return [speciesWatch, chrWatch, startWatch, endWatch];
                };

                /**
                 * Maximize Genoverse container width.
                 */
                ctrl.setGenoverseWidth = function() {
                    var w = $('.container').width();
                    $scope.browser.setWidth(w);

                    // resize might change viewport location - digest these changes
                    $timeout(angular.noop)
                };

                // Helper functions
                // ----------------

                /**
                 * Returns an object from genomes Array by its species name or null, if not found.
                 * @param name {string} e.g. "Homo sapiens" or "homo_sapiens" (like in url) or "human" (synonym)
                 * @returns {Object || null} element of genomes Array
                 */
                function getGenomeByName(name) {
                    name = name.replace(/_/g, ' '); // if name was urlencoded, replace '_' with whitespaces

                    for (var i = 0; i < genomes.length; i++) {
                        if (name.toLowerCase() == genomes[i].species.toLowerCase()) { // test scientific name
                            return genomes[i];
                        }
                        else { // if name is not a scientific name, may be it's a synonym?
                            var synonyms = []; // convert all synonyms to lower case to make case-insensitive comparison

                            genomes[i].synonyms.forEach(function(synonym) {
                                synonyms.push(synonym.toLowerCase());
                            });

                            if (synonyms.indexOf(name.toLowerCase()) > -1) return genomes[i];
                        }
                    }

                    return null; // if no match found, return null
                }

                /**
                 * Takes a genome on input, looks into its division attribute and returns the corresponding Ensembl
                 * subdomain
                 *
                 * @param genome {Object} e.g.
                 * {
                 *     'species': 'Mus musculus', 'synonyms': ['mouse'], 'assembly': 'GRCm38', 'assembly_ucsc': 'mm10',
                 *     'taxid': 10090, 'division': 'Ensembl',
                 *     'example_location': {'chromosome': 1, 'start': 86351981, 'end': 86352127,}
                 * }
                 * @returns {String} domain name without protocol or slashes or trailing dots
                 */
                function getEnsemblSubdomainByDivision(genome) {
                    var subdomain;

                    if (genome.division == 'Ensembl') {
                        subdomain = 'ensembl.org';
                    } else if (genome.division == 'Ensembl Plants') {
                        subdomain = 'plants.ensembl.org';
                    } else if (genome.division == 'Ensembl Metazoa') {
                        subdomain = 'metazoa.ensembl.org';
                    } else if (genome.division == 'Ensembl Bacteria') {
                        subdomain = 'bacteria.ensembl.org';
                    } else if (genome.division == 'Ensembl Fungi') {
                        subdomain = 'fungi.ensembl.org';
                    } else if (genome.division == 'Ensembl Protists') {
                        subdomain = 'protists.ensembl.org';
                    }

                    return subdomain;
                }
            }],
            link: function(scope, $element, attrs, ctrl, transcludeFn) {
                // We are going to temporarily add child directive's template to $element
                // so it can be linked to scope, but after it's linked, we detach it.
                transcludeFn(function(clone) {
                    $element.find('#for-tracks').append(clone);
                }).detach(); // <- Immediately detach it

                ctrl.render();

                // resize genoverse on browser width changes - attach once only
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
                'name':            '@',
                'labels':          '@?',
                'id':              '@?',
                'model':           '=',
                'modelExtra':      '=?',
                'url':             '=',
                'view':            '=',
                'viewExtra':       '=?',
                'controller':      '=',
                'controllerExtra': '=?',
                'resizable':       '@?',
                'autoHeight':      '@?',
                'extra':           '=?'
            },
            link: function(scope, element, attrs, genoverseCtrl) {
                console.log("genoverseTrack scope = ", scope);
                var trackConfig = {};

                trackConfig.name           = scope.name;
                trackConfig.model          = scope.model;
                trackConfig.view           = scope.view;
                trackConfig.controller     = scope.controller;
                trackConfig.url            = scope.url;

                if (scope.labels)          trackConfig.labels = scope.labels;
                if (scope.id)              trackConfig.id = scope.id;
                if (scope.resizable)       trackConfig.resizable = scope.resizable;
                if (scope.autoHeight)      trackConfig.autoHeight = scope.autoHeight;

                if (scope.modelExtra)      trackConfig.modelExtra = scope.modelExtra;
                if (scope.viewExtra)       trackConfig.viewExtra = scope.viewExtra;
                if (scope.controllerExtra) trackConfig.controllerExtra = scope.controllerExtra;
                if (scope.extra)           trackConfig.extra = scope.extra;

                console.log("genoverseTrack trackConfig = ", trackConfig);

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
