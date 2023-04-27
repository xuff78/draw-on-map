import BaseLayer from '#/layer/BaseLayer'
import {HeatmapOptions} from '#/layer/models/interface'
import HeatmapModel from '#/layer/models/heatmap'

const getDefaultOptions = (options?: Partial<HeatmapOptions>): Partial<HeatmapOptions> => {
    return Object.assign({
        colors: [
            [0, 'rgba(0, 0, 0, 0)'],
            [0.1, '#92cdff'],
            [0.2, 'rgb(103,169,207)'],
            [0.3, '#1E90FF'],
            [0.4, '#00C78C'],
            [0.6, '#FFD700'],
            [1, '#EE3B3B'],
        ],
        height: 5,
        radius: 5,
        weight: 30000,
    }, options)
}

export default class HeatmapLayer extends BaseLayer {
    constructor(map, options?: Partial<HeatmapOptions>) {
        const mapServices = map.MapKitServices
        const shapeModel = new HeatmapModel(mapServices)
        const _options = getDefaultOptions(options)
        delete _options.hover
        super(shapeModel, mapServices, _options)
    }

    setData(datas: number[][]) {
        this._datas = datas
        this.layerModel.setData(datas)
    }
}
