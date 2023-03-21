import ShapeModel from './models/shape'
import BaseLayer from '#/layer/BaseLayer'
import { ShapeOptions } from '#/layer/models/interface'
import VectorObject from "#/obj/vector-object";

const getDefaultOptions = (options?: Partial<ShapeOptions>): Partial<ShapeOptions> => {
  return Object.assign({ gradualArrow: true }, options)
}

class ShapeLayer extends BaseLayer {
  constructor(map, options?: Partial<ShapeOptions>) {
    const _options = getDefaultOptions(options)
    const mapServices = map.MapKitServices
    const shapeModel = new ShapeModel(mapServices)
    super(shapeModel, mapServices, _options)
  }

  setData(datas: VectorObject[]) {
    const features = this.getFeaturesFromData(datas)
    this.layerModel.setData(features)
  }
}

export default ShapeLayer
