import {ILayerModel} from '#/layer/interface'
import { grayVs, grayFs } from '../glsl/heatmap.js'
import { getGSLSSource } from '#/utils/webglUtils'
import BaseModel from '#/layer/BaseModel'
import REGL from 'regl/regl'
import { IModelOptions } from '#/renderer/interface'

export default class GrayMapModel extends BaseModel implements ILayerModel {
    private readonly grayMapDraw: REGL.DrawCommand
    // private maxPointCount: number = 30000
    private pointCount: number = 0

    constructor(mapServices) {
        super(mapServices)
        const { vert, frag } = getGSLSSource(grayVs, grayFs)
        const modelOptions: IModelOptions = {
            vert,
            frag,
            attributes: ['position', 'intensity'],
            uniforms: ['extent', 'resolution'],
            primitive: 'triangles',
            blend: {
                enable: true,
                // func: {
                //     src: 'one',
                //     dst: 'one',
                // },
                // equation: 'add',
                // color: [0, 0, 0, 0],
            },
            elements: 'indexBuffer',
            pick: false,
            // depth: { // 这里我们关闭深度测试
            //     enable: false,
            //     mask: false,
            // },
        }
        this.grayMapDraw = this.getDrawCommand(modelOptions)
    }

    async setData(datas: number[][]) {
        const position: number[][] = []
        const intensity: number[] = []
        this.pointCount = 0
        const addVertex = (x, y, xs, ys, i) => {
            position.push([x, y, xs, ys])
            intensity.push(i)
        }
        datas.forEach(data => {
            const x = Number(data[0])
            const y = Number(data[1])
            const s = data[2]
            const intensity = data[3]
            addVertex(x, y, -s, -s, intensity)
            addVertex(x, y, +s, -s, intensity)
            addVertex(x, y, +s, +s, intensity)
            addVertex(x, y, -s, +s, intensity)

            const index = this.pointCount * 4
            this.indexBuffer.push(index, 1 + index, 3 + index, 3 + index, 1 + index, 2 + index)
            this.pointCount += 1
        })
        this.attributes = {
            position,
            intensity,
        }
        // console.log('attr', this.attributes)
    }

    renderGrayMap(resolution, extent) {
        const bufferProps: any = this.getBufferProps(false)
        bufferProps.resolution = resolution
        bufferProps.extent = extent
        this.grayMapDraw(bufferProps)
    }

    onRenderer(usePickFBO: boolean) {}
}
