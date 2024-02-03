type Prop<TKey extends Str> = RObj<TKey, Num>

type RectL = Prop<'leftX'>
type RectB = Prop<'bottomY'>
type RectW = Prop<'width'>
type RectH = Prop<'height'>

export type RectPos = RectL & RectB
export type RectSize = RectW & RectH
export type Vec = Prop<'x'> & Prop<'y'>

export type Rect = RectPos & RectSize;

export function area(size: RectSize): Num {
  return size.width * size.height;
}

export function rightX(rect: Rect): Num {
  return rect.leftX + rect.width;
}

export function topY(rect: Rect): Num {
  return rect.bottomY + rect.height;
}

export function centerX(rect: Rect): Num {
  return rect.leftX + rect.width / 2;
}

export function centerY(rect: Rect): Num {
  return rect.bottomY + rect.height / 2;
}

export function center(rect: Rect): Vec {
  return {
    x: centerX(rect),
    y: centerY(rect),
  };
}

export function distance(a: Vec, b: Vec): Num {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function fits(containerSize: RectSize, childSize: RectSize): Bool {
  return containerSize.width >= childSize.width && containerSize.height >= childSize.height;
}

export function overlap(a: Rect, b: Rect): Rect | Nul {
  const lx = Math.max(a.leftX, b.leftX);
  const by = Math.max(a.bottomY, b.bottomY);
  const rx = Math.min(rightX(a), rightX(b));
  const ty = Math.min(topY(a), topY(b));
  const overlap: Rect = {
    leftX: lx,
    bottomY: by,
    width: rx - lx,
    height: ty - by,
  };
  return isValidSize(overlap) ? overlap : null;
}

export function isValidSize(size: RectSize): Bool {
  return size.width > 0 && size.height > 0;
}

export function split(container: Rect, child: Rect): RArr<Rect> {
  if (!overlap(container, child)) {
    return [container];
  }
  return [
    { ...container, width: child.leftX - container.leftX }, // left
    { ...container, leftX: rightX(child), width: rightX(container) - rightX(child) }, // right
    { ...container, height: child.bottomY - container.bottomY }, // bottom
    { ...container, bottomY: topY(child), height: topY(container) - topY(child) }, // top
  ].filter(isValidSize);
}