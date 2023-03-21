import BaseLayer from '#/layer/BaseLayer'
import { ShapeOptions } from '#/layer/models/interface'
import LineModel from '#/layer/models/line'
import VectorObject from '#/obj/vector-object'

const getDefaultOptions = (options?: Partial<ShapeOptions>): Partial<ShapeOptions> => {
  return Object.assign({ gradualArrow: true }, options)
}

export default class LineLayer extends BaseLayer {
  constructor(map, options?: Partial<ShapeOptions>) {
    const _options = getDefaultOptions(options)
    const mapServices = map.MapKitServices
    const shapeModel = new LineModel(mapServices)
    super(shapeModel, mapServices, _options)
  }

  setData(datas: VectorObject[]) {
    const features = this.getFeaturesFromData(datas)
    this.layerModel.setData(features)
  }
}
