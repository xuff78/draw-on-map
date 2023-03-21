import { LayerManager } from '#/services/LayerManager'
import { PickService } from '#/services/PickService'
import { MapServices } from '#/services/index'
const actionList = ['click', 'mousemove']
export class InteractiveEvents {
  private layerManager: LayerManager
  private pickService: PickService
  private map: any
  private onRender = false
  private mouseEvent: any
  constructor(map: any, services: MapServices) {
    this.map = map
    this.layerManager = services.layerManager
    this.pickService = services.pickService
    this.addRenderCallBack()
    this.addActionListener()
  }
  /** 减少滑动中绘制次数，避免频繁绘制 */
  addRenderCallBack() {
    let startTime = 0
    this.map.on('render', () => {
      this.layerManager.renderLayers()
      this.onRender = true
      const currentTime = new Date().getTime()
      if (this.mouseEvent && currentTime - startTime > 400) {
        this.pickingLayers()
        startTime = currentTime
      }
    })
    this.map.on('idle', () => {
      this.onRender = false
    })
  }

  addActionListener() {
    actionList.forEach((type) => {
      this.map.on(type, (e) => {
        this.mouseEvent = e
        if (!this.onRender) {
          this.pickingLayers()
          this.mouseEvent = null
        }
      })
    })
  }

  pickingLayers() {
    const e = this.mouseEvent
    const { x, y } = e.point
    // console.log('event', e.type)
    this.pickService.pickingLayers({
      x,
      y,
      lngLat: e.lngLat.toArray(),
      type: e.type,
      target: e.originalEvent,
    })
  }
}
