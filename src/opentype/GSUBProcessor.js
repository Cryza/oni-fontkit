import OTProcessor from './OTProcessor';
import Glyph from '../glyph/Glyph';

export default class GSUBProcessor extends OTProcessor {
  applyLookup(lookupType, table) {
    switch (lookupType) {
      case 1: { // Single Substitution
        let index = this.coverageIndex(table.coverage);
        if (index === -1) {
          return false;
        }

        let glyph = this.glyphIterator.cur;
        let gid;
        switch (table.version) {
          case 1:
            gid = (glyph.id + table.deltaGlyphID) & 0xffff;
            break;

          case 2:
            gid = table.substitute.get(index);
            break;
        }

        const replacement = this.font.getGlyph(gid, glyph.codePoints);
        this.glyphs.splice(this.glyphIterator.index, 1, replacement);
        return true;
      }

      case 2: { // Multiple Substitution
        let index = this.coverageIndex(table.coverage);
        if (index !== -1) {
          let sequence = table.sequences.get(index);

          let replacement = sequence.map((gid => this.font.getGlyph(gid, undefined)));

          const contextGroupIdToInsert = this.contextGroups[this.glyphIterator.index]
          const contextGroupToInsert = Array(sequence.length).fill(contextGroupIdToInsert)
          this.glyphs.splice(this.glyphIterator.index, 1, ...replacement);
          this.contextGroups.splice(this.glyphIderator.index, 1, ...contextGroupToInsert)
          return true;
        }

        return false;
      }

      case 3: { // Alternate Substitution
        let index = this.coverageIndex(table.coverage);
        if (index !== -1) {
          let USER_INDEX = 0; // TODO
          const gid = table.alternateSet.get(index)[USER_INDEX];
          const replacement = this.font.getGlyph(gid, glyph.codePoints);
          this.glyphs.splice(this.glyphIterator.index, 1, replacement);
          return true;
        }

        return false;
      }

      case 4: { // Ligature Substitution
        let index = this.coverageIndex(table.coverage);
        if (index === -1) {
          return false;
        }

        for (let ligature of table.ligatureSets.get(index)) {
          let matched = this.sequenceMatchIndices(1, ligature.components);
          if (!matched) {
            continue;
          }

          let curGlyph = this.glyphIterator.cur;

          // Concatenate all of the characters the new ligature will represent
          let characters = curGlyph.codePoints.slice();
          let contextGroupsToMerge = [this.contextGroups[this.glyphIterator.index]];
          for (let index of matched) {
            characters.push(...this.glyphs[index].codePoints);
            contextGroupsToMerge.push(this.contextGroups[index]);
          }
          this.mergeContextGroups(contextGroupsToMerge);

          // Create the replacement ligature glyph
          let ligatureGlyph = this.font.getGlyph(ligature.glyph, characters);

          // Delete the matched glyphs, and replace the current glyph with the ligature glyph
          for (let i = matched.length - 1; i >= 0; i--) {
            this.glyphs.splice(matched[i], 1);
            this.contextGroups.splice(matched[i], 1);
          }

          this.glyphs[this.glyphIterator.index] = ligatureGlyph;
          return true;
        }

        return false;
      }

      case 5: // Contextual Substitution
        return this.applyContext(table);

      case 6: // Chaining Contextual Substitution
        return this.applyChainingContext(table);

      case 7: // Extension Substitution
        return this.applyLookup(table.lookupType, table.extension);

      default:
        throw new Error(`GSUB lookupType ${lookupType} is not supported`);
    }
  }
}
