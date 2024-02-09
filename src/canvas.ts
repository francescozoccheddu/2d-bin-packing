import '@francescozoccheddu/ts-goodies/globals/essentials';

import { startClock } from 'src/clock';
import { LinearListBinSet } from 'src/linear-list-bin-set';
import { LinearSetBinSet } from 'src/linear-set-bin-set';
import { area, centerX, centerY, floatTowards, Rect, RectPos, RectSize, rectVecDistance } from 'src/rect';

export type CanvasDebugLogger = (log: Str) => void;

export type CanvasChooser = (containers: Iterable<Rect>, childSize: RectSize, canvas: Canvas) => Iterable<Rect>;

export type CanvasPositioner = (container: Rect, childSize: RectSize, canvas: Canvas) => RectPos | Nul;

export type CanvasBinSetBuilder = (container: Rect, canvas: Canvas) => CanvasBinSet;

export type CanvasPushOpts = R<{
  chooser: CanvasChooser;
  positioner: CanvasPositioner;
}>

export type CanvasOpts = R<{
  binSetBuilder: CanvasBinSetBuilder;
  debugLogger: CanvasDebugLogger | Nul;
}> & CanvasPushOpts

export type CanvasBinSet = R<{
  findFitting(size: RectSize): Iterable<Rect>;
  occupy(rect: Rect): void;
}>

export const choosers = {

  any: (candidates: Iterable<Rect>) => candidates,
  smallest: (candidates: Iterable<Rect>) => [...candidates].sort((a, b) => area(a) - area(b)),
  largest: (candidates: Iterable<Rect>) => [...candidates].sort((a, b) => area(b) - area(a)),
  center: (candidates: Iterable<Rect>, _: RectSize, canvas: Canvas) => {
    const c = {
      x: centerX(canvas.rect),
      y: centerY(canvas.rect),
    };
    return [...candidates].sort((a, b) => rectVecDistance(a, c) - rectVecDistance(b, c));
  },

} as const satisfies RStrObj<CanvasChooser>;

export const positioners = {

  bottomLeft: (container: Rect) => ({
    leftX: container.leftX,
    bottomY: container.bottomY,
  }),
  canvasCenter: (container: Rect, childSize: RectSize, canvas: Canvas) => floatTowards(container, childSize, {
    x: centerX(canvas.rect),
    y: centerY(canvas.rect),
  }),
  center: (container: Rect, childSize: RectSize) => floatTowards(container, childSize, {
    x: centerX(container),
    y: centerY(container),
  }),
  random: (container: Rect, childSize: RectSize) => ({
    leftX: container.leftX + Math.random() * (container.width - childSize.width),
    bottomY: container.bottomY + Math.random() * (container.height - childSize.height),
  }),

} as const satisfies RStrObj<CanvasPositioner>;

export const binSetBuilders = {

  linearList: (container: Rect, canvas: Canvas) => new LinearListBinSet(container, { debugLogger: canvas.opts.debugLogger }),
  linearSet: (container: Rect, canvas: Canvas) => new LinearSetBinSet(container, { debugLogger: canvas.opts.debugLogger }),

} as const satisfies RStrObj<CanvasBinSetBuilder>;

export const debugLoggers = {

  console: console.debug,
  none: null,

} as const satisfies RStrObj<CanvasDebugLogger | Nul>;

export const defaultOpts: CanvasOpts = {
  chooser: choosers.any,
  positioner: positioners.bottomLeft,
  debugLogger: debugLoggers.none,
  binSetBuilder: binSetBuilders.linearList,
};

export class Canvas {

  private readonly _rect: Rect;
  private readonly _opts: CanvasOpts;
  private readonly _binSet: CanvasBinSet;

  constructor(rect: Rect, opts?: Partial<CanvasOpts>);
  constructor(size: RectSize, opts?: Partial<CanvasOpts>);
  constructor(rectOrSize: Rect | RectSize, opts: Partial<CanvasOpts> = {}) {
    this._rect = {
      leftX: 0,
      bottomY: 0,
      ...rectOrSize,
    };
    this._opts = {
      ...defaultOpts,
      ...opts,
    };
    this._binSet = this._opts.binSetBuilder(this._rect, this);
  }

  push(size: RectSize, opts: Partial<CanvasPushOpts> = {}): Rect | Nul {
    const clock = startClock();
    const chooser = opts.chooser ?? this._opts.chooser;
    const positioner = opts.positioner ?? this._opts.positioner;
    const containters = chooser(this._binSet.findFitting(size), size, this);
    for (const container of containters) {
      const position = positioner(container, size, this);
      if (position) {
        const rect = { ...position, ...size };
        if (this._opts.debugLogger) {
          this._opts.debugLogger(`Positioned rect in ${clock().debugString}`);
        }
        this.occupy(rect);
        return rect;
      }
    }
    if (this._opts.debugLogger) {
      this._opts.debugLogger(`Failed to position rect in ${clock().debugString}`);
    }
    return null;
  }

  occupy(rect: Rect): void {
    const clock = startClock();
    this._binSet.occupy(rect);
    if (this._opts.debugLogger) {
      this._opts.debugLogger(`Occupied rect in ${clock().debugString}`);
    }
  }

  get opts(): CanvasOpts {
    return this._opts;
  }

  get rect(): Rect {
    return this._rect;
  }

}