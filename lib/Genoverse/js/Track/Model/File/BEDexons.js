Genoverse.Track.Model.File.BEDexons = Genoverse.Track.Model.File.extend({

    // convert BED data into the format expected by Genoverse.Track.View.Transcript.Ensembl
    parseData: function (text) {

      // each line contains a transcript with several exons
      // chr1 29554 31097 URS000063C361 0 + 29554 31097 63,125,151  3 485,103,121 0,1010,1422
      var lines = text.split('\n');

      for (var i = 0; i < lines.length; i++) {
        var fields = lines[i].split('\t');

        if (fields.length < 3) {
          continue;
        }

        if (fields[0] === this.browser.chr || fields[0].toLowerCase() === 'chr' + this.browser.chr || fields[0].match('[^1-9]' + this.browser.chr + '$')) {

          // create the parent transcript element
          transcript = {
            id              : fields[1] + '-' + fields[3],
            feature_type    : 'transcript',
            logic_name      : 'RNAcentral',
            biotype         : 'lincRNA',
            label           : fields[3],
            start           : parseInt(fields[1], 10),
            end             : parseInt(fields[2], 10),
            strand          : fields[5] == '+' ? 1 : -1,
            exons           : [],
            cds             : [],
            originalFeature : fields,
            score           : parseFloat(fields[4], 10)
          };

          // create exons and add them to the parent transcript
          blockSizes = fields[10].split(',');
          blockStarts = fields[11].split(',');

          for (var j = 0; j < fields[9]; j++){
            exon = {
              feature_type : 'exon',
              start: transcript.start + parseInt(blockStarts[j],10),
              end: transcript.start + parseInt(blockStarts[j],10) + parseInt(blockSizes[j],10),
              id: fields[3] + '-' + j,
              Parent: fields[1] + '-' + fields[3]
            }
            transcript.exons.push(exon);
            transcript.exons[exon.id] = exon;
          }

          // store the feature
          this.insertFeature(transcript);
      }
    }
  }
});
