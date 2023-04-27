import {ILayerModel, LayerOptions, MassImage} from '#/layer/interface'
import BaseModel from '#/layer/BaseModel'
import REGL from 'regl/regl'
import { IModelOptions } from '#/renderer/interface'
import {drawFs, drawVs} from '#/layer/glsl/heatmap'
import {getGradientImage} from '#/utils/color'
import GrayMapModel from '#/layer/models/graymap'
import {HeatmapOptions} from "#/layer/models/interface";

const gridy = 800
const gridx = 800
export default class HeatmapModel extends BaseModel implements ILayerModel {
    private readonly heatmapDraw: REGL.DrawCommand
    private gradientTexture: REGL.Texture2D | undefined
    private grayFBO: REGL.Framebuffer2D
    private graymap: GrayMapModel
    private positionAttr: [number, number][] = []
    constructor(mapServices) {
        super(mapServices)
        this.graymap = new GrayMapModel(mapServices)
        const { vert, frag } = this.getGSLSSource(true)
        const modelOptions: IModelOptions = {
            vert,
            frag,
            attributes: ['position'],
            uniforms: ['gradientTexture', 'grayTexture', 'extent', 'view_matrix', 'maxHeight', 'opacity'],
            primitive: 'triangles',
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
            pick: false,
        }
        this.heatmapDraw = this.getDrawCommand(modelOptions)
        const { getViewportSize, createFramebuffer, createTexture2D } = this.sdkRenderer
        const { width, height } = getViewportSize()
        const grayTexture = createTexture2D({ width, height, wrap: 'clamp', channels: 4 })
        this.grayFBO = createFramebuffer({ color: grayTexture, depth: true })
        this.fillData(gridx, gridy)
        this.attributes = { position: this.positionAttr }
        // console.log(vert, frag)
    }

    async setData(datas: number[][]) {
        let defaultIntensity = 1
        const points = datas.map(item => {
            const info = [...item]
            const intensity = (defaultIntensity * item[2]) / this.options.weight
            info.push(intensity > 1 ? 1 : intensity)
            info[2] = this.options.radius
            return info
        })
        await this.graymap.setData(points)
    }

    setOptions(opts: HeatmapOptions) {
        super.setOptions(opts)
        this.graymap.setOptions(opts)
        const canvas = getGradientImage(this.options.colors)
        this.gradientTexture = this.sdkRenderer.createTexture2D({
            data: canvas,
            width: 200,
            height: 50,
            wrap: 'clamp',
            // channels: 4
        })
        // console.log('??11??', this.gradientTexture)
    }

    onRenderer(useFBO: boolean) {
        const { useFramebuffer, clear } = this.sdkRenderer
        // const gl = getGL()
        const { resolution, extent, maxHeight, viewMatrix } = this.getMapInfo()
        const bufferProps: any = this.getBufferProps(false)
        bufferProps.gradientTexture = this.gradientTexture
        // bufferProps.source = this.gradientTexture
        bufferProps.grayTexture = this.grayFBO
        bufferProps.opacity = 1
        bufferProps.extent = extent
        bufferProps.view_matrix = viewMatrix
        bufferProps.maxHeight = maxHeight
        // this.heatmapDraw(bufferProps, () => {
        // gl.draw()
        clear({
            framebuffer: this.grayFBO,
            color: [0, 0, 0, 0],
            depth: 0,
        })
        useFramebuffer(this.grayFBO, () => {
            this.graymap.renderGrayMap(resolution, extent)
        })
        // console.log('bufferProps', bufferProps)
        this.heatmapDraw(bufferProps)
        // })

    }

    getMapInfo() {
        const zoom = this.mapServices.getZoom()
        let resolution = 1.4062500000000002 / Math.pow(2, zoom)
        let bounds = this.mapServices.getBounds().toArray()
        let extent = bounds[0].concat(bounds[1])
        let padding = resolution * 100
        extent[0] -= padding
        extent[1] -= padding
        extent[2] += padding
        extent[3] += padding
        extent[0] = extent[0] < -180 ? -180 : extent[0]
        extent[1] = extent[1] < -85 ? -85 : extent[1]
        extent[2] = extent[2] > 180 ? 180 : extent[2]
        extent[3] = extent[3] > 85 ? 85 : extent[3]
        let ext = 1
        if (zoom <= 11) ext = 1 / (1 + (11 - zoom) / 2)
        if (zoom > 11) ext = zoom - 10
        const maxHeight = this.options.height / ext
        const viewMatrix = this.mapServices.getViewMatrix()
        return {
            resolution,
            extent,
            maxHeight,
            viewMatrix
        }
    }

    getGSLSSource(intensityToAlpha = true, alphaRange?) {
        let alphaEnd, alphaStart, output
        const getColorFun = `
          uniform sampler2D gradientTexture;\n
          vec3 getColor(float intensity){\n
            return texture2D(gradientTexture, vec2(intensity, 0.0)).rgb;\n
          }`
        if (intensityToAlpha) {
            const range = alphaRange ? alphaRange : [0, 0.5]
            alphaStart = range[0]
            alphaEnd = range[1]
            output =
                'vec4 alphaFun(vec3 color, float intensity){\n    float alpha = smoothstep(' +
                alphaStart.toFixed(8) +
                ', ' +
                alphaEnd.toFixed(8) +
                ', intensity);\n    return vec4(color*alpha, alpha);\n}'
        } else {
            output = 'vec4 alphaFun(vec3 color, float intensity){\n    return vec4(color, 1.0);\n}'
        }
        return { vert: drawVs, frag: drawFs(getColorFun, output) }
    }

    fillData(gridx, gridy) {
        let i,
            j,
            i1,
            j1,
            count = 0

        outer: for (i = 0; i < gridy; i++) {
            i1 = i + 1
            if (i1 > gridy) {
                continue outer
            }
            inner: for (j = 0; j < gridx; j++) {
                j1 = j + 1
                if (j1 > gridx) {
                    continue inner
                }
                if (count === 0) {
                    for (let i = 0; i < 6; i++) {
                        this.positionAttr.push([0, 0])
                    }
                }
                count += 6
                this.fillQuad(i, j, i1, j1, count, gridy, gridx)
            }
        }
    }

    fillQuad(i, j, i1, j1, count, gridy, gridx) {
        const vx = j / gridx
        const vy = i / gridy
        const vx1 = j1 / gridx
        const vy1 = i1 / gridy

        this.positionAttr.push([vx, vy1])
        this.positionAttr.push([vx1, vy1])
        this.positionAttr.push([vx, vy])
        this.positionAttr.push([vx, vy])
        this.positionAttr.push([vx1, vy1])
        this.positionAttr.push([vx1, vy])

        this.indexBuffer.push([0, 1, 2], [3, 4, 5])
    }
}
