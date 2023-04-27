import BaseLayer from '#/layer/BaseLayer'
import LineModel from '#/layer/models/line'
import VectorObject from '#/obj/vector-object'
import {LayerOptions} from '#/layer/interface'

export default class LineLayer extends BaseLayer {
  constructor(map, options?: Partial<LayerOptions>) {
    const mapServices = map.MapKitServices
    const shapeModel = new LineModel(mapServices)
    super(shapeModel, mapServices, options || {})
  }

  setData(datas: VectorObject[]) {
    const features = this.getFeaturesFromData(datas)
    this.layerModel.setData(features)
  }
}
