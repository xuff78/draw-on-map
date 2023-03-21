import { ReglRendererService } from '#/renderer'
import REGL from 'regl/regl'
import BaseLayer from '#/layer/BaseLayer'
import { InteractiveMouseEvent } from '#/services/interface'
import { decodePickingColor } from '#/utils/color'
import { LayerManager } from '#/services/LayerManager'

export class PickService {
  private rendererService: ReglRendererService
  private pickingFBO: REGL.Framebuffer2D
  private width = 0
  private height = 0
  private layerManager: LayerManager

  constructor(sdkRenderer: ReglRendererService, layerManager: LayerManager) {
    this.rendererService = sdkRenderer
    this.layerManager = layerManager
    const { getViewportSize, createFramebuffer, createTexture2D } = this.rendererService
    const { width, height } = getViewportSize()
    this.pickingFBO = createFramebuffer({
      color: createTexture2D({
        width,
        height,
        wrap: 'clamp',
      }),
      depth: true,
    })
  }

  resizePickingFBO() {
    const { getViewportSize } = this.rendererService
    const { width, height } = getViewportSize()

    if (this.width !== width || this.height !== height) {
      this.pickingFBO.resize(width, height)
      this.width = width
      this.height = height
    }
  }

  async pickingLayers(target: InteractiveMouseEvent) {
    const { useFramebuffer, clear } = this.rendererService
    this.resizePickingFBO()

    useFramebuffer(this.pickingFBO, () => {
      const layers = this.layerManager.getAllLayers()
      layers
        .filter((layer) => {
          return layer.needPick(target.type)
        })
        .reverse()
        .forEach((layer) => {
          // console.log('???')
          clear({
            framebuffer: this.pickingFBO,
            color: [0, 0, 0, 0],
            stencil: 0,
            depth: 1,
          })

          layer.renderPick()
          this.pickFromPickingFBO(layer, target)
          // this.layerService.pickedLayerId = isPicked ? +layer.id : -1;
          // return isPicked && !layer.getLayerConfig().enablePropagation;
        })
    })
  }

  public pickFromPickingFBO = (layer: BaseLayer, { x, y, lngLat, type, target }: InteractiveMouseEvent) => {
    if (x === 0 || y === 0) return
    let isPicked = false
    const { readPixels, getViewportSize } = this.rendererService
    const { width, height } = getViewportSize()
    const pickedColors = readPixels({
      x: Math.round(x),
      // 视口坐标系原点在左上，而 WebGL 在左下，需要翻转 Y 轴
      y: Math.round(height - y),
      width: 1,
      height: 1,
      data: new Uint8Array(4),
      framebuffer: this.pickingFBO,
    })

    if (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0) {
      const pickedFeatureId = decodePickingColor(pickedColors)
      // console.log('pickedFeatureId', pickedFeatureId, pickedColors)
      if (null === layer.getCurrentPickId() && type === 'mousemove') {
        type = 'mouseenter'
      }
      const vectorObj = layer.getVectorByPickId(pickedFeatureId)
      if (!vectorObj) console.error('未找到对应覆盖物')
      const layerTarget = {
        x,
        y,
        type,
        lngLat,
        vectorObj,
        featureId: pickedFeatureId,
        target,
      }
      isPicked = true
      layer.setCurrentPickId(pickedFeatureId)
      this.triggerHoverOnLayer(layer, layerTarget)
    } else {
      if (layer.getCurrentPickId() !== null && type === 'mousemove') {
        const layerTarget = {
          x,
          y,
          lngLat,
          type: 'mouseout',
          target,
        }
        this.triggerHoverOnLayer(layer, layerTarget)
      }
      layer.setCurrentPickId(null)
    }
    return isPicked
  }

  public triggerHoverOnLayer(layer: BaseLayer, target: InteractiveMouseEvent) {
    // 判断是否发生事件冲突
    // if (isEventCrash(target)) {
    // Tip: 允许用户动态设置鼠标光标
    this.handleCursor(layer, target.type)
    layer.emit(target.type, target)
    // }
  }

  public destroy() {
    this.pickingFBO.destroy()
    // this.pickingFBO = null; 清除对 webgl 实例的引用
    // @ts-ignore
    this.pickingFBO = null
  }

  handleCursor(layer, type) {
    const options = layer.getLayerConfig()
    if (options.hover.useMouseHover) {
      const mouseStyle = options.hover.hoverMouseStyle
      if (type === 'mouseenter') {
        this.rendererService.getCanvas().style.cursor = mouseStyle
      } else if (type === 'mouseout') {
        this.rendererService.getCanvas().style.cursor = ''
      }
    }
  }
}
