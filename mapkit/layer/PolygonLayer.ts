import BaseLayer from '#/layer/BaseLayer'
import PolygonModel from '#/layer/models/polygon'
import LineModel from '#/layer/models/line'
import VectorObject from '#/obj/vector-object'
import {LayerOptions} from '#/layer/interface'

export default class PolygonLayer extends BaseLayer {
  constructor(map, options?: Partial<LayerOptions>) {
    const mapServices = map.MapKitServices
    const shapeModel = new PolygonModel(mapServices)
    super(shapeModel, mapServices, options || {})
    const mode = new LineModel(mapServices)
    this.setCoopModels([mode])
  }

  setData(datas: VectorObject[]) {
    const features = this.getFeaturesFromData(datas)
    this.layerModel.setData(features)
    this.coopModels.forEach(model => {
      model.setData(features)
    })
  }
}
