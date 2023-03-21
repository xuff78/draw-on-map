import {ILayerModel, MassImage} from '#/layer/interface'
import { vs_mass, fs_mass } from '../glsl/mass.js'
import { getGSLSSource } from '#/utils/webglUtils'
import BaseModel from '#/layer/BaseModel'
import REGL from 'regl/regl'
import { IModelOptions } from '#/renderer/interface'
import {encodePickingColor} from "#/utils/color";
import {loadImage} from "#/services/ImageLoader";

export default class ShapeModel extends BaseModel implements ILayerModel {
    private readonly massDraw: REGL.DrawCommand
    private bufferDataArray: any[] = []

    constructor(mapServices) {
        super(mapServices)
        const { vert, frag } = getGSLSSource(vs_mass, fs_mass)
        const modelOptions: IModelOptions = {
            vert,
            frag,
            attributes: ['a_pos', 'a_pick_color'],
            uniforms: ['u_icon_offset', 'u_point_size', 'u_sampler', 'u_opacity'],
            primitive: 'points',
            blend: {
                enable: true,
                func: {
                    srcRGB: 'src alpha',
                    srcAlpha: 'src alpha',
                    dstRGB: 'one minus src alpha',
                    dstAlpha: 1,
                },
            },
            elements: 'indexBuffer',
            // count: 10000,
            pick: true,
        }
        this.massDraw = this.getDrawCommand(modelOptions)
    }

    async setData(massImages) {
        this.bufferDataArray = []
        const images = await loadImage(massImages.map(item => item.url))
        // console.log('images', images)
        console.log('massImages', massImages)
        massImages.forEach((massImage: MassImage, index) => {
            const result = images[index]
            if (result.status === 'fulfilled') {
                const bufferData: any = {}
                const a_pos: [number, number][] = []
                const a_pick_color: [number, number, number][] = []
                const indexBuffer: number[] = []
                massImage.points.forEach((point, pos) => {
                    indexBuffer.push(pos)
                    a_pos.push([Number(point.lngLat[0]), Number(point.lngLat[1])])
                    a_pick_color.push(encodePickingColor(point.pickId))
                })
                bufferData.aPos = a_pos
                bufferData.aPickColor = a_pick_color
                bufferData.uSampler = this.sdkRenderer.createTexture2D({
                    data: result.value,
                    width: massImage.size,
                    height: massImage.size
                })
                bufferData.indexBuffer = indexBuffer
                bufferData.uPointSize = massImage.size
                this.bufferDataArray.push(bufferData)
            }
        })
    }

    onRenderer(useFBO: boolean) {
        this.bufferDataArray.forEach(bufferData => {
            const bufferProps: any = this.getBufferProps(useFBO)
            const {aPos, aPickColor, uSampler, uPointSize, indexBuffer} = bufferData
            bufferProps.a_pos = aPos
            bufferProps.u_sampler = uSampler
            bufferProps.a_pick_color = aPickColor
            bufferProps.u_icon_offset = [0, 0]
            bufferProps.u_point_size = uPointSize
            bufferProps.u_opacity = 1
            bufferProps.indexBuffer = indexBuffer
            this.massDraw(bufferProps)
        })
    }
}
