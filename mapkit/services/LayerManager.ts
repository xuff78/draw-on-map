import BaseLayer from '#/layer/BaseLayer'

export class LayerManager {
  private layerList: BaseLayer[] = []
  addLayer(layer: BaseLayer) {
    const index = this.findLayerIndex(layer)
    if (index !== -1) {
      console.log(layer, this.layerList)
      throw new Error('已存在此图层')
    }
    this.insertLayer(layer)
  }
  changeLayerIndex(layer: BaseLayer) {
    const currentIndex = this.findLayerIndex(layer)
    if (currentIndex !== -1) {
      this.layerList.splice(currentIndex, 1)
      this.insertLayer(layer)
    }
  }
  renderLayers() {
    for (const layer of this.layerList) {
      layer.render()
    }
  }
  getAllLayers() {
    return this.layerList
  }
  /** 用于插入排序 */
  private insertLayer(layer: BaseLayer) {
    const setIndex = layer.getLayerConfig().zIndex
    const targetIndex = this.layerList.findIndex((itemLayer) => itemLayer.getLayerConfig().zIndex > setIndex)
    if (targetIndex !== -1) {
      this.layerList.splice(targetIndex, 0, layer)
    } else {
      this.layerList.push(layer)
    }
  }
  private findLayerIndex(layer: BaseLayer) {
    return this.layerList.findIndex((itemLayer) => itemLayer.getLayerId() === layer.getLayerId())
  }
}
