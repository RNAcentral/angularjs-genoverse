AngularJS - Genoverse
=====================

[![Build Status](https://travis-ci.org/RNAcentral/angularjs-genoverse.svg?branch=master)](https://travis-ci.org/RNAcentral/angularjs-genoverse)
[![npm version](https://badge.fury.io/js/angularjs-genoverse.svg)](https://badge.fury.io/js/angularjs-genoverse)
[![Bower version](https://badge.fury.io/bo/angularjs-genoverse.svg)](https://badge.fury.io/bo/angularjs-genoverse)

An AngularJS (1.x) directive, wrapping the [Genoverse genome browser](https://github.com/wtsi-web/Genoverse) version 3.

Read more about how to use the browser here: http://wtsi-web.github.io/Genoverse/.

Example
=======

A complete example is available at: https://RNAcentral.github.io/angularjs-genoverse/

Use this directive as a "web component" in your HTML:

```HTML
<genoverse genome="genome" chromosome="chromosome" start="start" end="end" example-locations="exampleLocations">
    <genoverse-track name="'Sequence'" model="Genoverse.Track.Model.Sequence.Ensembl" view="Genoverse.Track.View.Sequence" controller="Genoverse.Track.Controller.Sequence" url="urls.sequence" resizable="'auto'" auto-height="true" extra="{100000: false}"></genoverse-track>
    <genoverse-track name="'Genes'" labels="true" info="'Ensembl API genes'" model="Genoverse.Track.Model.Gene.Ensembl" view="Genoverse.Track.View.Gene.Ensembl" url="urls.genes" resizable="'auto'" auto-height="true"></genoverse-track>
    <genoverse-track name="'Transcripts'" labels="true" info="'Ensembl API transcripts'" model="Genoverse.Track.Model.Transcript.Ensembl" view="Genoverse.Track.View.Transcript.Ensembl" url="urls.transcripts" resizable="'auto'" auto-height="true"></genoverse-track>
</genoverse>
```


Installation and requirements
=============================

This package is available at [NPM](https://www.npmjs.com/package/angularjs-genoverse) and [Bower](https://github.com/RNAcentral/angularjs-genoverse).

We don't provide wrappers for AMD, CommonJS or ECMA6 modules, so you might need a shim for Webpack, Browserify, SystemJS or RequireJS.

To include the script with this directive in your HTML, use:

```HTML
<!-- Uglified version -->
<script src=".../angularjs-genoverse/dist/angularjs-genoverse.min.js"></script>

<!-- Concatenated, but non-obfuscated source -->
<script src=".../angularjs-genoverse/dist/angularjs-genoverse.all.js"></script>
```


You'll also need the Genoverse browser itself (both JS and CSS). You can either download it
directly from [github](https://github.com/wtsi-web/Genoverse), or use the version, included in this repository's `lib` folder:

```HTML
<!-- CSS -->
<link rel="stylesheet" href="/lib/Genoverse/css/genoverse.css">
<link rel="stylesheet" href="/lib/Genoverse/css/controlPanel.css">
<link rel="stylesheet" href="/lib/Genoverse/css/fileDrop.css">
<link rel="stylesheet" href="/lib/Genoverse/css/karyotype.css">
<link rel="stylesheet" href="/lib/Genoverse/css/resizer.css">
<link rel="stylesheet" href="/lib/Genoverse/css/trackControls.css">
<link rel="stylesheet" href="/lib/Genoverse/css/tooltips.css">

<!-- Javascript -->
<script src=".../angularjs-genoverse/lib/Genoverse/js/genoverse.combined.js"></script>
<script src=".../angularjs-genoverse/lib/Genoverse/js/genomes/grch38.js"></script>

```


To use it in your AngularJS module, you need to specify `Genoverse` module as a dependency, e.g.

```javascript
angular.module("Example", ["Genoverse"]);
```

AngularJS-Genoverse depends on `angular.js` and `jquery`. Don't forget to include them as well.

Configuration
=============

We have 2 directives in this package: `<genoverse>` and `<genoverse-track>`.

Below is the full description of their attributes that you can use to configure them.

Note that all attributes are interpolated, i.e. use 2-way data-binding. So if you try passing an attribute as
`<genoverse attr="val">`, angular will look for variable, called "val", not a string "val". If you want just to pass
a literal, use another pair of quotes like: `<genoverse attr="'literal'"`.

genoverse
---------

Global configuration of the browser. To specify tracks, use nested `<genoverse-track>` tags within `genoverse`.

For more details, see: https://github.com/simonbrent/Genoverse/blob/master/docs/configuration.md (:warning: This fork of Genoverse contains latest documentation, but obsolete codebase).


Attribute          | Type               | Required | Default                                              | Description
------------------ | ------------------ | -------- | ---------------------------------------------------- | -----------
genome             | Object             | true     |                                                      | Name of genome to display with lowercase letters and underscore, e.g. 'homo_sapiens'
chr                | String             | true     |                                                      | Ensembl-style chromosome name, e.g. 'X' or '1' or '3R' or 'III'
start              | Number             | true     |                                                      | Current genome location, where viewport starts
end                | Number             | true     |                                                      | Current genome location, where viewport ends
example-locations  | Object             | false    |                                                      | What location to display, when switching to another species e.g. {'homo_sapiens': {'chr': 'X', 'start': 73819307, 'end': 73856333}}
highlights         | Array              | false    | []                                                   | Array of regions to highlight, in the form `{ "start": 100, "end", 200, "label": "My highlight", "removable": false }`
plugins            | Array              | false    | ['controlPanel', 'karyotype', 'resizer', 'fileDrop'] | Array of plugins to use (chosen from `Genoverse/js/plugins`) ! Default different from original Genoverse
url-param-template | String/Boolean     | false    | false                                                | Replace url upon browser drags with this template interpolation  ! Default different from original Genoverse
useHash            | Boolean/undefined  | false    | undefined                                            | How URL is updated upon navigation (options: `true`=`window.location.hash`, `false`=`window.history.pushState`, `undefined`=HTML5history if available or fallback to hash, if not)
drag-action        | String             | false    | "scroll"                                             | Action performed on mouse drag (options: `"scroll"`, `"select"`, `"off"`)
wheel-action       | String             | false    | "off"                                                | Action performed on wheel spin (options: `"zoom"`, `"off"`)
is-static          | Boolean            | false    | false                                                | If `true`, will stop drag, select and zoom actions occuring
saveable           | Boolean            | false    | false                                                | If true, track configuration and ordering will be saved in `sessionStorage/localStorage`
storage-type       | String             | false    | "sessionStorage"                                     | Storage to use to save track configuration (options: `"sessionStorage"`, `"localStorage"`)
save-key           | String             | false    | undefined                                            | Default key, used in configuration storage is "genoverse". `saveKey` will be appended to it, if defined
auto-hide-messages | Boolean            | false    | true                                                 | Determines, whether to collapse popups with messages on tracks by default
track-auto-height  | Boolean/undefined  | false    | true                                                 | Determines, whether to auto-resize tracks to show all feauteres (can be overridden per-track by track's `auto-height`)
hide-empty-tracks  | Boolean/undefined  | false    | true                                                 | Determines, whether to auto-hide tracks with no features in viewport (can be overridden per-track with track's `hide-empty`)


genoverseTrack
--------------

Configuration of a single track. Note that you don't have to create Scalebar track - it's present by default.

For more details, see: https://github.com/simonbrent/Genoverse/blob/master/docs/tracks/configuration.md (:warning: This fork of Genoverse contains latest documentation, but obsolete codebase).


Attribute          | Type               | Required | Default                                  | Description
----------------   | ------------------ | -------- | ---------------------------------------- | -----------
model              | Object             | true     |                                          | `Genoverse.Track.Model` subclass
model-extra        | Object             | false    |                                          | Extra parameters to extend your model with: `model.extend(modelExtra)`
view               | Object             | true     |                                          | `Genoverse.Track.View` subclass
view-extra         | Object             | false    |                                          | Extra parameters to extend your view with: `view.extend(viewExtra)`
controller         | Object             | false    |                                          | `Genoverse.Track.Controller` subclass
controller-extra   | Object             | false    |                                          | Extra parameters to extend your controller with: `controller.extend(controllerExtra)`
extra              | Object             | false    |                                          | Extra parameters to extend your track's configuration, e.g. `track.extend(extra)`
name               | String             | true     |                                          | Track name
height             | Number             | false    | 12                                       | Initial height of track in pixels
resizable          | Boolean/String     | false    | true                                     | If track's able to change height (options: `true`, `false`, `"auto"`)
auto-height        | Boolean/undefined  | false    | browser.trackAutoHeight                  | If track automatically resizes to keep features visible (options: `true`, `false`, `undefined` for default)
hide-empty         | Boolean/undefined  | false    | browser.hideEmptyTracks                  | If track is hidden if there are no features to display in viewport (options: `true`, `false`, `undefined` for default)
margin             | Number             | false    | 2                                        | Space in pixels below the track and next track
border             | Boolean            | false    | true                                     | If true, track has a border under it
unsortable         | Boolean            | false    | false                                    | If true, track re-ordering can't touch this track
url                | String/Function    | true     |                                          | ! Different from original Genoverse: String template OR function that returns string template that track uses to download features data to display.<br><br> E.g. 'https://rest.ensemblgenomes.org/sequence/region/homo_sapiens/__CHR__:__START__-__END__?content-type=text/plain'.<br><br>Note that it uses `__ASSEMBLY__`, `__CHR__`, `__START__` and `__END__` variables, but doesn't support a variable for species/genome.
url-params         | Object             | false    | undefined                                | Object of query params, added to url, e.g. `{'foo': 'bar', 'x': 'y'}` -> `/?foo=bar&x=y`
data               |                    | false    | undefined                                | Instead of loading feautures with AJAX, pass them pre-defined.
all-data           | Boolean            | false    | false                                    | If all data are loaded in a single request and consequent AJAX calls are not required upon scrolling.
data-request-limit | Number             | false    | undefined                                |
data-type          | String             | false    | undefined                                | dataType setting to be used in the jQuery.ajax for getting data ! Different from original Genoverse: default undefined, not "json"
xhr-fields         | PlainObject        | false    | undefined                                | xhrFieds setting to be used in the jQuery.ajax for getting data
feature-height     | Number             | false    | track.height                             | Height of each feature
feature-margin     | Object             | false    | { top: 3, right: 1, bottom: 1, left: 0 } | Space in pixels around each feature, when positioning on canvas and for bumping
color              | String             | false    | "#000000"                                | Color of each feature
font-color         | String             | false    | feature.color (if any) or track.color    | Default color for feature labels
font-weight        | String/Number      | false    | "normal"                                 | Font weight
font-height        | Number             | false    | 10                                       | Font height
font-family        | String             | false    | "sans-serif"                             | Font family
labels             | Boolean/String     | false    | true                                     | Determines, how labels are drawn (options: `true`, `"overlay"`, `"separate"` or `false`)
repeat-labels      | Boolean            | false    | false                                    | If true, label is repeated along the length of feature
bump               | Boolean/String     | false    | false                                    | If features are moved vertically within the track so that they don't overlap (options: `true`, `false`, `"labels"`)
depth              | Number             | false    | undefined                                | Maximum bumping depth for features in track, if required depth for a features is greater, it's not drawn
threshold          | Number             | false    | Infinity                                 | If threshold is exceeded, features on track are not drawn
click-tolerance    | Number             | false    | 0                                        | By how many pixels at most you can drag the mouse, so that it's still considered a click (showing a popup), not a drag.
id                 | String             | false    |                                          |
