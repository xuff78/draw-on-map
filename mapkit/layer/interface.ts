interface ILayerModel {
  setData(datas: any[])
  setOptions(options: LayerOptions)
  onRenderer(useFbo: boolean)
  setPickId(id: number)
}

interface HoverOptions {
  hoverMouseStyle?: string
  hoverColor?: string
  hoverOpacity?: number
  useMouseHover: boolean
}

interface LayerOptions {
  zIndex: number
  zooms: [number, number]
  hover: HoverOptions
  [key: string]: any
}

interface MassImage {
  url: string
  size: number
  points: MassPoint[]
}

interface MassPoint {
  lngLat: [number, number]
  [key: string]: any
}

export type { ILayerModel, HoverOptions, LayerOptions, MassImage, MassPoint }
