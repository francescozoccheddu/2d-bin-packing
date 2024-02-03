import { CanvasBinSet, CanvasDebugLogger } from 'src/canvas';
import { area, fits, Rect, RectSize, split } from 'src/rect';

export type LinearSetBinSetOpts = R<{
  debugLogger: CanvasDebugLogger | Nul;
  minRelativeArea: Num;
}>

export const defaultLinearSetBinSetOpts: LinearSetBinSetOpts = {
  debugLogger: null,
  minRelativeArea: 1 / 1000,
};

export class LinearSetBinSet implements CanvasBinSet {

  private readonly _rect: Rect;
  private readonly _opts: LinearSetBinSetOpts;
  private readonly _minArea: Num;
  private _bins: Set<Rect>;

  constructor(rect: Rect, opts: Partial<LinearSetBinSetOpts> = {}) {
    this._rect = rect;
    this._opts = {
      ...defaultLinearSetBinSetOpts,
      ...opts,
    };
    this._minArea = area(this._rect) * this._opts.minRelativeArea;
    this._bins = new Set([this._rect]);
  }

  get rect(): Rect {
    return this._rect;
  }

  get opts(): LinearSetBinSetOpts {
    return this._opts;
  }

  *findFitting(size: RectSize): Iterable<Rect> {
    if (size.width > this._rect.width || size.height > this._rect.height) {
      return;
    }
    for (const bin of this._bins) {
      if (fits(bin, size)) {
        yield bin;
      }
    }
  }

  occupy(rect: Rect): void {
    const oldBinCount = this._bins.size;
    const addedBins: Arr<Rect> = [];
    for (const bin of this._bins) {
      const newBins = split(bin, rect);
      if (newBins.length === 1 && newBins[0] === bin) {
        continue;
      }
      this._bins.delete(bin);
      addedBins.push(...newBins.filter(b => area(b) > this._minArea));
    }
    addedBins.forEach(bin => this._bins.add(bin));
    this._opts.debugLogger?.(`Occupied rect: ${oldBinCount} => ${this._bins.size} bins`);
  }

}