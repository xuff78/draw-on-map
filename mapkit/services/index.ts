import { InteractiveEvents } from '#/services/InteractiveEvents'
import { LayerManager } from '#/services/LayerManager'
import { PickService } from '#/services/PickService'
import { ReglRendererService } from '#/renderer'
import Map from './map'

export class MapServices {
  interEvents: InteractiveEvents
  layerManager: LayerManager
  pickService: PickService
  sdkRenderer: ReglRendererService
  private map: Map
  constructor(map: Map) {
    this.map = map
    this.sdkRenderer = new ReglRendererService(
      {
        stencil: true,
        preserveDrawingBuffer: true,
        antialias: true,
      },
      map.getCanvas(),
    )
    this.layerManager = new LayerManager()
    this.pickService = new PickService(this.sdkRenderer, this.layerManager)
    this.interEvents = new InteractiveEvents(map, this)
  }

  mapRepaint() {
    this.map.triggerRepaint()
  }

  getCameraPosition() {
    return {
      zoom: this.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
      center: this.map.getCenter(),
    }
  }
  getZoom() {
    return this.map.getZoom()
  }
  getBounds() {
    return this.map.getBounds()
  }
  getViewMatrix() {
    return this.map.transform.projMatrix
  }
}
