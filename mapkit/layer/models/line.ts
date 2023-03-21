import BaseModel from '#/layer/BaseModel'
import {ILayerModel, LayerOptions} from '#/layer/interface'
import { getGSLSSource } from '#/utils/webglUtils'
import { fs_line, vs_line } from '#/layer/glsl/line'
import { IModelOptions } from '#/renderer/interface'
import REGL from 'regl/regl'
import ExtrudePolyline from '#/utils/extrude_polyline'
import { createAttributesAndIndices } from '#/layer/models/attrHelp'

export default class LineModel extends BaseModel implements ILayerModel {
  private readonly lineDraw: REGL.DrawCommand
  constructor(mapServices) {
    super(mapServices)
    const { vert, frag } = getGSLSSource(vs_line, fs_line)
    const modelOptions: IModelOptions = {
      vert,
      frag,
      attributes: [
        'a_pos',
        'a_color',
        'a_pick_color',
        'a_miter',
        'a_size',
        'a_normal',
        'a_total_distance',
        'a_distance_index',
      ],
      uniforms: ['u_heightfixed', 'u_vertexScale', 'u_raisingHeight', 'u_borderColor', 'u_borderWidth', 'u_blur'],
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
    this.lineDraw = this.getDrawCommand(modelOptions)
  }

  setData(features: any[]) {
    const extrudeLine = createAttributesAndIndices(features, this.getLineExtrude)
    // console.log('help', extrudeLine)
    // console.log('coords', coords)
    // console.log('attrIndex', attrIndex)
    const attrPos: number[][] = []
    const attrNormal: number[][] = []
    const attrMiter: number[][] = []
    const attrSize: number[][] = []
    const attrColor: number[][] = []
    const attrPickColor: number[][] = []
    const attrTotalDis: number[][] = []
    const attrDistanceIndex: number[][] = []

    extrudeLine.attr.forEach((item) => {
      // console.log('attr', item)
      const { feature, featureIdx, vertice, normal, vertexIdx, vertexIndex } = item
      const props = feature.properties
      attrPos.push([vertice[0], vertice[1], vertice[2]])
      attrColor.push(props.strokeColor)
      attrPickColor.push(props.pickColor)
      attrNormal.push(normal)
      attrSize.push([props.strokeWeight, 0])
      attrTotalDis.push([vertice[5]])
      attrMiter.push([vertice[4]])
      attrDistanceIndex.push([vertice[3], vertexIndex])
    })
    this.attributes = {
      a_pos: attrPos,
      a_color: attrColor,
      a_pick_color: attrPickColor,
      a_miter: attrMiter,
      a_size: attrSize,
      a_normal: attrNormal,
      a_total_distance: attrTotalDis,
      a_distance_index: attrDistanceIndex,
    }
    // console.log('attributes', this.attributes)
    this.indexBuffer = extrudeLine.indices
    // console.log('indexBuffer', this.indexBuffer)
  }

  getLineExtrude(coordinates) {
    const line = new ExtrudePolyline({
      dash: false,
      join: 'bevel',
      cap: 'butt',
    })
    let path = coordinates as number[][][] | number[][]
    if (path[0] && !Array.isArray(path[0][0])) {
      path = [coordinates] as number[][][]
    }
    path.forEach((item: any) => {
      line.extrude(item as number[][])
    })
    const linebuffer = line.complex
    return {
      vertices: linebuffer.positions, // [ x,y,z, distance, miter,total ]
      indices: linebuffer.indices,
      normals: linebuffer.normals,
      indexes: linebuffer.indexes,
      size: 6,
    }
  }

  onRenderer(useFbo: boolean) {
    const props: any = this.getBufferProps(useFbo)
    props.u_heightfixed = 0
    props.u_vertexScale = 20.0
    props.u_raisingHeight = 0
    props.u_borderColor = this.options.bolderColor || [0, 0, 0, 1]
    props.u_borderWidth = this.options.bolderWidth || 0
    props.u_blur = [1, 1, 0]
    this.lineDraw(props)
  }
}
