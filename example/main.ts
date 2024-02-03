import fs from 'fs';
import path from 'path';
import { Canvas, debugLoggers } from 'src/canvas';
import { Rect, RectSize } from 'src/rect';

const canvasSize: RectSize = { width: 1000, height: 500 };
const rectCount = 50;
const minRectRelativeSize = 1 / 50;
const maxRectRelativeSize = 1 / 5;

function rand(from: Num, to: Num): Num {
  return Math.random() * (to - from) + from;
}

const canvas = new Canvas(canvasSize, {
  debugLogger: debugLoggers.console,
});

const rects: Arr<Rect> = [];

for (let i = 0; i < rectCount; i++) {
  const rectSize: RectSize = {
    width: rand(minRectRelativeSize, maxRectRelativeSize) * canvasSize.width,
    height: rand(minRectRelativeSize, maxRectRelativeSize) * canvasSize.height,
  };
  const rect = canvas.push(rectSize);
  if (rect) {
    console.log(`${i + 1}/${rectCount}: Added <${rectSize.width.toFixed(3)}, ${rectSize.height.toFixed(3)}> at <${rect.leftX.toFixed(3)}, ${rect.bottomY.toFixed(3)}>`);
    rects.push(rect);
  }
  else {
    console.log(`${i + 1}/${rectCount}: Failed to add <${rectSize.width.toFixed(3)}, ${rectSize.height.toFixed(3)}>`);
  }
}

const svg = `
  <?xml version="1.0" encoding="utf-8"?>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
  ${rects
    .map(rect => `
      <rect 
        x="${rect.leftX}" 
        y="${rect.bottomY}" 
        width="${rect.width}" 
        height="${rect.height}" 
        fill="hsl(${Math.round(rand(0, 360))}deg,${Math.round(rand(30, 100))}%,${Math.round(rand(30, 70))}%)"
      />`)
    .join('\n')}
  </svg>
`.trim();

const outFile = path.join(__dirname, 'example.svg');
fs.writeFileSync(outFile, svg);
console.log(`Written to '${outFile}'`);