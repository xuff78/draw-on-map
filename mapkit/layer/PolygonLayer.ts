import BaseLayer from '#/layer/BaseLayer'
import { ShapeOptions } from '#/layer/models/interface'
import PolygonModel from '#/layer/models/polygon'
import LineModel from '#/layer/models/line'
import VectorObject from '#/obj/vector-object'

export default class PolygonLayer extends BaseLayer {
  constructor(map, options?: Partial<ShapeOptions>) {
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
