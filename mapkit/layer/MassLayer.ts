import BaseLayer from '#/layer/BaseLayer'
import MassModel from '#/layer/models/mass'
import {LayerOptions, MassImage, MassPoint} from '#/layer/interface'

export default class MassLayer extends BaseLayer {
    constructor(map, options?: Partial<LayerOptions>) {
        const mapServices = map.MapKitServices
        const shapeModel = new MassModel(mapServices)
        super(shapeModel, mapServices, options || {})
    }

    setData(datas: MassImage[]) {
        const imgDatas: MassPoint[] = []
        let i = 0
        datas.forEach((massImg, index) => {
            massImg.points.forEach(point => {
                point.pickId = i
                imgDatas.push(point)
                i++
            })
        })
        this._datas = imgDatas
        this.layerModel.setData(datas)
    }
}
