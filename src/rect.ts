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

export function vecLen(vec: Vec): Num {
  return Math.sqrt(vec.x ** 2 + vec.y ** 2);
}

export function vecDistance(a: Vec, b: Vec): Num {
  return vecLen({
    x: a.x - b.x,
    y: a.y - b.y,
  });
}

export function rectVecDistance(a: Rect, b: Vec): Num {
  return vecLen({
    x: Math.max(a.leftX - b.x, 0, b.x - rightX(a)),
    y: Math.max(a.bottomY - b.y, 0, b.y - topY(a)),
  });
}

export function fits(containerSize: RectSize, childSize: RectSize): Bool {
  return containerSize.width >= childSize.width && containerSize.height >= childSize.height;
}

export function floatTowards(container: Rect, childSize: RectSize, center: Vec): Rect {
  const desiredPosition: RectPos = {
    leftX: center.x - childSize.width / 2,
    bottomY: center.y - childSize.height / 2,
  };
  return {
    ...childSize,
    leftX: clamp(desiredPosition.leftX, container.leftX, rightX(container) - childSize.width),
    bottomY: clamp(desiredPosition.bottomY, container.bottomY, topY(container) - childSize.height),
  };
}

export function clamp(value: Num, min: Num, max: Num): Num {
  return Math.min(Math.max(min, value), max);
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