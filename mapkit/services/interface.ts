export interface InteractiveMouseEvent {
  x: number
  y: number
  lngLat: [number, number]
  type: string
  featureId?: number
  vectorObj?: unknown
  target: MouseEvent | TouchEvent
}

export interface LngLat {
  lng: number
  lat: number
}

export interface CameraPosition {
  center: LngLat
  zoom: number
  bearing: number
  pitch: number
}
