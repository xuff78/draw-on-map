import { ILayerModel } from '#/layer/interface'
import { vs_sdf, fs_sdf } from '../glsl/shape'
import { getVertexBufferData } from '../../utils/compress'
import { getGSLSSource } from '#/utils/webglUtils'
import BaseModel from '#/layer/BaseModel'
import REGL from 'regl/regl'
import { IModelOptions } from '#/renderer/interface'

export default class ShapeModel extends BaseModel implements ILayerModel {
  private readonly shapeDraw: REGL.DrawCommand

  constructor(mapServices) {
    super(mapServices)
    const { vert, frag } = getGSLSSource(vs_sdf, fs_sdf)
    const modelOptions: IModelOptions = {
      vert,
      frag,
      attributes: ['a_pos', 'a_color', 'a_type_radius', 'a_angle_stroke', 'a_extrude', 'a_pick_color'],
      primitive: 'triangles',
      elements: 'indexBuffer',
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 'src alpha',
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha', // 1
        },
      },
      pick: true,
    }
    this.shapeDraw = this.getDrawCommand(modelOptions)
  }

  setData(features) {
    // const buffers = []
    // const arrows: number[] = []
    const indexBuffer = []
    const extrudeArray: [number, number][] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]
    let i = 0

    const a_pos: [number, number][] = []
    const a_color: number[][] = []
    const a_type_radius: number[] = []
    const a_angle_stroke: [number, number][] = []
    const a_extrude: [number, number][] = []
    const a_pick_color: [number, number, number][] = []
    features.forEach((point) => {
      const prop = point.properties
      const { color, pick_color, type_radius, angle_stroke } = getVertexBufferData(prop)
      extrudeArray.forEach((extrude) => {
        const coord = point.geometry.coordinates
        a_pos.push(coord)
        a_color.push(color)
        a_type_radius.push(type_radius)
        a_angle_stroke.push(angle_stroke)
        a_extrude.push(extrude)
        a_pick_color.push(pick_color)
      })
      // @ts-ignore
      indexBuffer.push([0 + i, 1 + i, 2 + i], [2 + i, 3 + i, 0 + i])
      i += 4
    })
    // this.buffers = buffers
    this.attributes = { a_pos, a_color, a_type_radius, a_angle_stroke, a_extrude, a_pick_color }
    this.indexBuffer = indexBuffer
    // console.log('attributes', this.attributes)
    // console.log('indexBuffer', this.indexBuffer)
  }

  onRenderer(useFBO: boolean) {
    this.shapeDraw(this.getBufferProps(useFBO))
  }
}
