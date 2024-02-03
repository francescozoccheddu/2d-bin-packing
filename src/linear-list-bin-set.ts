import { CanvasBinSet, CanvasDebugLogger } from 'src/canvas';
import { area, fits, Rect, RectSize, split } from 'src/rect';

export type LinearListBinSetOpts = R<{
  debugLogger: CanvasDebugLogger | Nul;
  minRelativeArea: Num;
}>

export const defaultLinearListBinSetOpts: LinearListBinSetOpts = {
  debugLogger: null,
  minRelativeArea: 1 / 1000,
};

export class LinearListBinSet implements CanvasBinSet {

  private readonly _rect: Rect;
  private readonly _opts: LinearListBinSetOpts;
  private readonly _minArea: Num;
  private _bins: Arr<Rect>;

  constructor(rect: Rect, opts: Partial<LinearListBinSetOpts> = {}) {
    this._rect = rect;
    this._opts = {
      ...defaultLinearListBinSetOpts,
      ...opts,
    };
    this._minArea = area(this._rect) * this._opts.minRelativeArea;
    this._bins = [this._rect];
  }

  get rect(): Rect {
    return this._rect;
  }

  get opts(): LinearListBinSetOpts {
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
    const oldBinCount = this._bins.length;
    this._bins = this._bins.flatMap(b => split(b, rect).filter(b => area(b) > this._minArea));
    this._opts.debugLogger?.(`Occupied rect: ${oldBinCount} => ${this._bins.length} bins`);
  }

}