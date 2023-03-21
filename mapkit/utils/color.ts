export function decodePickingColor(color: Uint8Array): number {
  const i1 = color && color[0]
  const i2 = color && color[1]
  const i3 = color && color[2]
  // 1 was added to seperate from no selection
  const index = i1 + i2 * 256 + i3 * 65536 - 1
  return index
}

export function encodePickingColor(featureIdx: number): [number, number, number] {
  return [(featureIdx + 1) & 255, ((featureIdx + 1) >> 8) & 255, (((featureIdx + 1) >> 8) >> 8) & 255]
}

export function hexToRgb(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(opacity * 255)]
    : [0, 0, 0, 255]
}
