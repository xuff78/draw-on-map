import { LayerOptions } from '#/layer/interface'

export interface ShapeOptions extends LayerOptions {
  gradualArrow: true
}

export interface HeatmapOptions extends LayerOptions {
  colors: [number, string][]
  height: number
  radius: number
  weight: number
}
