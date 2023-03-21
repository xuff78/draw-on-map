import { clamp } from 'lodash-es'
const LEFT_SHIFT1 = 2
// const LEFT_SHIFT2 = 4;
const LEFT_SHIFT6 = 64
// const LEFT_SHIFT7 = 128;
const LEFT_SHIFT8 = 256
const LEFT_SHIFT9 = 512
// const LEFT_SHIFT13 = 8192;
// const LEFT_SHIFT14 = 16384;
// const LEFT_SHIFT15 = 32768;
const LEFT_SHIFT16 = 32768 * 2
const LEFT_SHIFT17 = 131072.0
// const LEFT_SHIFT18 = 262144.0;
const LEFT_SHIFT19 = 524288.0
// const LEFT_SHIFT20 = 1048576.0;
const LEFT_SHIFT21 = 2097152.0
// const LEFT_SHIFT22 = 4194304.0;
const LEFT_SHIFT23 = 8388608.0
const LEFT_SHIFT24 = 16777216.0
const LEFT_SHIFT25 = 16777216.0 * 2

/**
 * 数据压缩（并未压缩到极致，待优化）
 */
export function getVertexBufferData({ fillColor, radius, strokeWeight, strokeColor, angle, shapeType, pickColor }) {
  const buffer = {
    color: [
      packUint8ToFloat(fillColor[0], fillColor[1]),
      packUint8ToFloat(fillColor[2], fillColor[3]),
      packUint8ToFloat(strokeColor[0], strokeColor[1]),
      packUint8ToFloat(strokeColor[2], strokeColor[3]),
    ],
    pick_color: pickColor,
    type_radius: shapeType * LEFT_SHIFT17 + radius,
    angle_stroke: angle * LEFT_SHIFT17 + strokeWeight,
  }
  return buffer
}

export function packUint8ToFloat(a, b): number {
  a = clamp(Math.floor(a), 0, 255)
  b = clamp(Math.floor(b), 0, 255)
  return 256 * a + b
}
