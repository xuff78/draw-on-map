export interface IRenderConfig {
  stencil: boolean
  preserveDrawingBuffer: boolean
  antialias: boolean
}

export interface IModelOptions {
  /**
   * 该 model 是否支持拾取
   */
  pick?: boolean
  vert: string
  frag: string

  uniforms?:
    | {
        [key: string]: any
      }
    | string[]

  attributes:
    | {
        [key: string]: any
      }
    | string[]

  /**
   * gl.POINTS | gl.TRIANGLES | ...
   * 默认值 gl.TRIANGLES
   */
  primitive?: string
  // 绘制的顶点数目
  count?: number
  // 默认值为 0
  offset?: number

  /**
   * gl.drawElements
   */
  elements?: any
  /**
   * 绘制实例数目
   */
  instances?: number

  colorMask?: [boolean, boolean, boolean, boolean]

  /**
   * depth buffer
   */
  depth?: Partial<{
    // gl.enable(gl.DEPTH_TEST)
    enable: boolean
    // gl.depthMask
    mask: boolean
    // gl.depthFunc
    func: number
    // gl.depthRange
    range: [0, 1]
  }>

  /**
   * blending
   */
  blend?: any

  /**
   * stencil
   */
  stencil?: any

  /**
   * cull
   */
  cull?: {
    // gl.enable(gl.CULL_FACE)
    enable: boolean
    // gl.cullFace
    face: number
  }
}
