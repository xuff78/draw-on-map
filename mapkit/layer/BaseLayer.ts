import { ILayerModel, LayerOptions } from '#/layer/interface'
import { EventEmitter } from 'eventemitter3'
import { MapServices } from '#/services'
import { createUUID } from '#/utils/'
import {encodePickingColor, hexToRgb} from "#/utils/color";
import VectorObject from "#/obj/vector-object";
export default abstract class BaseLayer extends EventEmitter {
  mapServices: MapServices
  layerModel: ILayerModel
  coopModels: ILayerModel[] = []
  _datas: any[] = []
  private layerId = createUUID()
  private isShow = true
  private currentPickId = -1
  private updateVectorList: VectorObject[] = []
  private timer: number | undefined
  private options: LayerOptions
  abstract setData(datas: any[])
  protected constructor(model: ILayerModel, mapServices: MapServices, options: Partial<LayerOptions>) {
    super()
    this.layerModel = model
    this.options = this.handleLayerOptions(options)
    this.mapServices = mapServices
    this.addToMap()
    model.setOptions(this.options)
  }
  private handleLayerOptions = (options): LayerOptions => {
    const result = Object.assign(
      {
        zooms: [3, 18],
        zIndex: 10,
        hover: false,
      },
      options,
    )
    if (typeof result.hover === 'boolean') {
      result.hover = {
        hoverMouseStyle: 'pointer',
        useMouseHover: !!result.hover,
      }
    }
    return result
  }
  setCoopModels(models: ILayerModel[]) {
    this.coopModels = models
  }
  setLayerIndex() {
    this.mapServices.layerManager.changeLayerIndex(this)
    this.mapServices.mapRepaint()
  }
  getLayerConfig() {
    return this.options
  }
  addToMap() {
    this.mapServices.layerManager.addLayer(this)
  }
  getData() {
    return this._datas
  }
  show() {
    this.setVisibility(true)
  }
  hide() {
    this.setVisibility(false)
  }
  private setVisibility(isShow: boolean) {
    this.isShow = isShow
    this.mapServices.mapRepaint()
  }
  getVisibility() {
    return this.isShow
  }
  needPick(type: string): boolean {
    // 判断layer是否监听事件;
    let isPick = this.eventNames().indexOf(type) !== -1
    if (this.options.hover.useMouseHover) {
      isPick = true
    } else if (type === 'click' || type === 'dblclick') {
      isPick = true
    } else if (
      type === 'mousemove' &&
      (this.eventNames().indexOf('mouseenter') !== -1 || this.eventNames().indexOf('mouseout') !== -1)
    ) {
      isPick = true
    }
    return this.isAvailable() && isPick
  }
  updateObject(target: VectorObject) {
    this.updateVectorList.push(target)
    this.setUpdateTimer()
  }

  render() {
    if (this.isAvailable()) {
      this.layerModel.onRenderer(false)
      this.coopModels.forEach((model) => {
        model.onRenderer(false)
      })
    }
  }

  renderPick() {
    if (this.isAvailable()) {
      this.layerModel.onRenderer(true)
    }
  }

  isAvailable() {
    const zoom = this.mapServices.getZoom()
    if (this.isShow && zoom >= this.options.zooms[0] && zoom <= this.options.zooms[1] && this._datas.length > 0) {
      return true
    }
    return false
  }

  setCurrentPickId(id) {
    this.layerModel.setPickId(id)
    if (id !== this.currentPickId) {
      this.mapServices.mapRepaint()
    }
    this.currentPickId = id
  }

  getCurrentPickId() {
    return this.currentPickId
  }

  getVectorByPickId(id) {
    return this._datas.find((data) => data.pickId === id)
  }

  getLayerId() {
    return this.layerId
  }

  setUpdateTimer() {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        const list = this.updateVectorList.concat()
        this.updateVectorList = []
        this.timer = undefined
        for (const target of list) {
          const index = this._datas.findIndex((item) => item.getId() === target.getId())
          if (index !== -1) {
            this._datas.splice(index, 1, target)
          }
        }
        this.setData(this._datas)
      })
    }
  }

  getFeaturesFromData(datas: VectorObject[]): any[] {
    const features: any[] = []
    datas.forEach((data, index) => {
      const feature = data.getGeojson()
      const properties: {[key: string]: any} = feature.properties
      properties.pickColor = encodePickingColor(index)
      if (properties.strokeColor) {
        properties.strokeColor = hexToRgb(properties.strokeColor, properties.strokeOpacity)
        delete properties.strokeOpacity
      }
      if (properties.fillColor) {
        properties.fillColor = hexToRgb(properties.fillColor, properties.fillOpacity)
        delete properties.fillOpacity
      }
      features.push(feature)
      data.updateObject = this.updateObject.bind(this)
      data.pickId = index
    })
    this._datas = datas
    return features
  }

  clearData() {
    this._datas = []
    this.layerModel.setData([])
  }
}
