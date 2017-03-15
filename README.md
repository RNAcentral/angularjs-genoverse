AngularJS - Genoverse
=====================

[![Build Status](https://travis-ci.org/RNAcentral/angularjs-genoverse.svg?branch=master)](https://travis-ci.org/RNAcentral/angularjs-genoverse)
[![npm version](https://badge.fury.io/js/angularjs-genoverse.svg)](https://badge.fury.io/js/angularjs-genoverse)

An AngularJS (1.x) directive, wrapping the [Genoverse genome browser](https://github.com/wtsi-web/Genoverse) version 3.

Read more about how to use the browser here: http://wtsi-web.github.io/Genoverse/.

Example
=======

A complete example is available at: https://RNAcentral.github.io/angularjs-genoverse/

Use this directive as a "web component" in your HTML:

```HTML
<genoverse genome="genome" chromosome="chromosome" start="start" end="end">
    <genoverse-track name="Sequence" model="Genoverse.Track.Model.Sequence.Ensembl" view="Genoverse.Track.View.Sequence" controller="Genoverse.Track.Controller.Sequence" url="urls.sequence" resizable="auto" autoHeight="{{true}}" extra="{100000: false}"></genoverse-track>
    <genoverse-track name="Genes" info="Ensembl API genes" model="Genoverse.Track.Model.Gene.Ensembl" view="Genoverse.Track.View.Gene.Ensembl" controller="Genoverse.Track.Controller.Ensembl" url="urls.genes" resizable="auto" autoHeight="{{true}}"></genoverse-track>
    <genoverse-track name="Transcripts" info="Ensembl API transcripts" model="Genoverse.Track.Model.Transcript.Ensembl" view="Genoverse.Track.View.Transcript.Ensembl" controller="Genoverse.Track.Controller.Ensembl" url="urls.transcripts" resizable="auto" autoHeight="{{true}}"></genoverse-track>
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

We have 2 directives in this package: genoverse and genoverse-track. Here is the full description of their attributes
that you can use to configure them.

genoverse
---------

Attribute  | Type   | Required | Description
---------- | ------ | -------- | -----------
genome     | Object | true     | {
           |        |          |   'species': 'Homo sapiens',
           |        |          |   'synonyms': ['human'],
           |        |          |   'assembly': 'GRCh38',
           |        |          |   'assembly_ucsc': 'hg38',
           |        |          |   'taxid': 9606,
           |        |          |   'division': 'Ensembl',
           |        |          |   'example_location': {
           |        |          |     'chromosome': 'X',
           |        |          |     'start': 73792205,
           |        |          |     'end': 73829231
           |        |          | }
chromosome | String | true     | Ensembl-style chromosome name, e.g. 'X'
start      | Number | true     | Current genome location, where viewport starts
end        | Number | true     | Current genome location, where viewport ends


genoverseTrack
--------------

Attribute       | Type               | Required | Default | Description
--------------- | ------------------ | -------- | ------- | -----------
name            | String             | true     |         | Track id
labels          | Boolean            | false    | true    | Display labels
id              | String             | false    |         |
model           | Object             | true     |         | Genoverse.Track.Model subclass
modelExtra      | Object             | false    |         | Extra parameters to extend your model with: `model.extend(modelExtra)`
url             | String OR Function | true     |         | String template or function that returns string template, where track gets features to display. E.g. 'https://rest.ensemblgenomes.org/sequence/region/homo_sapiens/__CHR__:__START__-__END__?content-type=text/plain'. Note that it uses `__CHR__`, `__START__` and `__END__` variables, but doesn't support a variable for species/genome.
view            | Object             | true     |         | Genoverse.Track.View subclass
viewExtra       | Object             | false    |         | Extra parameters to extend your view with: `view.extend(viewExtra)`
controller      | Object             | true     |         | Genoverse.Track.Controller subclass
controllerExtra | Object             | false    |         | Extra parameters to extend your controller with: `controller.extend(controllerExtra)`
resizable       | String             | false    | 'auto'  | Allow user to resize tracks by dragging a handle?
autoHeight      | Boolean            | false    | false   | Automatically resize tracks upon load to take as much space as is required to display all features
extra           | Object             | false    |         | Extra parameters to extend your track's configuration, e.g. `track.extend(extra)`

