import r from 'oni-restructure';

var fontkit = {};
export default fontkit;

fontkit.logErrors = false;

let formats = [];
fontkit.registerFormat = function(format) {
  formats.push(format);
};

fontkit.create = function(buffer, postscriptName) {
  for (let i = 0; i < formats.length; i++) {
    let format = formats[i];
    if (format.probe(buffer)) {
      let font = new format(new r.DecodeStream(buffer));
      if (postscriptName) {
        return font.getFont(postscriptName);
      }

      return font;
    }
  }

  throw new Error('Unknown font format');
};
