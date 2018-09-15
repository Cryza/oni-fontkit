import { Stream } from "stream";

export interface Font {
  // TODO verify optionality
  postscriptName: string;
  fullName?: string;
  familyName?: string;
  subfamilyName?: string;
  copyright?: string;
  version?: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  lineGap: number;
  underlinePosition: number;
  underlineThickness: number;
  italicAngle: number;
  capHeight: number;
  xHeight: number;
  bbox: BBox;
  numGlyphs: number;
  characterSet: number[];
  availableFeatures: string[];
  glyphForCodePoint(codePoint: number): Glyph | null;
  hasGlyphForCodePoint(codePoint: number): boolean;
  glyphsForString(text: string): Glyph[];
  applySubstitutionFeatures(glyphs: Glyph[], features: string[]): number[];
  variationAxes: { [axisTag: string]: VariationAxis };
  namedVariations: { [variationName: string]: Variation };
  getVariation(variationName: string): Font;
  getVariation(variation: Variation): Font;
  getGlyph(glyphId: number, codePoints: number[]): Glyph;
  createSubset(): Subset;
}

export declare class BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  constructor(minX?: number, minY?: number, maxX?: number, maxY?: number);
  addPoint(x, y): void;
  copy(): BBox;
}

interface VariationAxis {
  name: string;
  min: number;
  default: number;
  max: number;
}

type Variation = { [variationAxisName: string]: number };

interface Subset {
  includeGlyph(glyphId: number): void;
  includeGlyph(glyph: Glyph): void;
  encodeStream(): Stream;
}

interface FontCollection {
  getFont(postscriptName: string): Font;
  fonts: Font[];
}

export declare class Glyph {
  id: number;
  codePoints: number[];
  path: Path;
  bbox: BBox;
  cbox: BBox;
  advanceWidth: number;
}

export interface Path {
  bbox: BBox;
  cbox: BBox;
  moveTo(x: number, y: number): Path;
  lineTo(x: number, y: number): Path;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Path;
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ): Path;
  closePath(): Path;
  toSVG(): string;
}

export interface EmojiGlyph {
  render(ctx: CanvasRenderingContext2D, size: number): void;
}

export declare class COLRGlyph extends Glyph implements EmojiGlyph {
  render(ctx: CanvasRenderingContext2D, size: number): void;
  layers: object[]; // TODO add more details
}

export declare class SBIXGlyph extends Glyph implements EmojiGlyph {
  render(ctx: CanvasRenderingContext2D, size: number): void;
  getImageForSize(size: number): object; // TODO add more details
}

export interface OniFontkit {
  open(
    filename: string,
    postscriptName: string,
    callback: (error: any, font: Font) => void
  ): void;
  open(filename: string, callback: (error: any, font: Font) => void): void;
  openSync(filename: string, postscriptName?: string): Font;
  create(buffer: Buffer, postscriptName?: string): Font;
}

declare const oniFontkit: OniFontkit;

export default oniFontkit;
