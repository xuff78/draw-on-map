import BaseModel from '#/layer/BaseModel'
import { ILayerModel } from '#/layer/interface'
import earcut from 'earcut'
import { getGSLSSource } from '#/utils/webglUtils'
import { fs_polygon, vs_polygon } from '#/layer/glsl/polygon'
import { IModelOptions } from '#/renderer/interface'
import REGL from 'regl/regl'

export default class PolygonModel extends BaseModel implements ILayerModel {
  private readonly polygonDraw: REGL.DrawCommand
  constructor(mapServices) {
    super(mapServices)
    const { vert, frag } = getGSLSSource(vs_polygon, fs_polygon)
    const modelOptions: IModelOptions = {
      vert,
      frag,
      attributes: ['a_pos', 'a_color', 'a_pick_color'],
      primitive: 'triangles',
      elements: 'indexBuffer',
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 'src alpha',
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
      },
      pick: true,
    }
    this.polygonDraw = this.getDrawCommand(modelOptions)
  }

  setData(features: any[]) {
    const a_pos: [number, number][] = []
    const a_color: number[][] = []
    const a_pick_color: [number, number, number][] = []
    let i = 0
    features.forEach((feature) => {
      // console.log('feature', feature)
      const prop = feature.properties
      const coords = feature.geometry.coordinates[0]
      const indices = earcut(coords.flat())
      indices.forEach((index) => {
        this.indexBuffer.push(i + index)
      })
      coords.forEach((coord) => {
        a_pos.push(coord)
        a_color.push(prop.fillColor)
        a_pick_color.push(prop.pickColor)
      })
      i += coords.length
    })
    this.attributes = { a_pos, a_color, a_pick_color }
    // console.log('attributes', this.attributes)
  }

  onRenderer(useFbo: boolean) {
    this.polygonDraw(this.getBufferProps(useFbo))
  }
}
