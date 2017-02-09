Genoverse.Track.File.BEDexons = Genoverse.Track.File.extend({
  name          : 'BED',
  bump          : true,
  featureHeight : 10,

  populateMenu: function (feature) {
    return {
      title       : 'Unique RNAcentral Sequence',
      name        : '<a target="_blank" href="http://test.rnacentral.org/rna/' + feature.originalFeature[3] + '">' + feature.originalFeature[3] + '</a>',
      chromosome  : feature.originalFeature[0],
      start       : feature.originalFeature[1],
      end         : feature.originalFeature[2],
      strand      : feature.originalFeature[5],
      blockCount  : feature.originalFeature[9],
      blockSizes  : feature.originalFeature[10],
      blockStarts : feature.originalFeature[11]
    };
  }
});