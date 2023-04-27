/**
 * render w/ regl
 * @see https://github.com/regl-project/regl/blob/gh-pages/API.md
 */
import regl from 'regl'
import { IModelOptions, IRenderConfig } from './interface'
import ReglModel from '#/renderer/ReglModel'

/**
 * regl renderer
 */
export class ReglRendererService {
  private gl: regl.Regl
  private width = 0
  private height = 0
  private canvas: HTMLCanvasElement

  constructor(cfg: IRenderConfig, canvas: HTMLCanvasElement, callBack?) {
    // console.log('gl', gl)
    const context = canvas.getContext('webgl')
    const gl = context ? context : undefined
    this.canvas = canvas
    this.gl = regl({
      gl: gl,
      attributes: {
        alpha: true,
        // use TAA instead of MSAA
        // @see https://www.khronos.org/registry/webgl/specs/1.0/#5.2.1
        antialias: cfg.antialias,
        premultipliedAlpha: true,
        preserveDrawingBuffer: cfg.preserveDrawingBuffer,

        stencil: cfg.stencil,
      },
      // TODO: use extensions
      extensions: [
        'OES_element_index_uint',
        'OES_standard_derivatives', // wireframe
        'ANGLE_instanced_arrays', // VSM shadow map
      ],
      optionalExtensions: [
        'oes_texture_float_linear',
        'OES_texture_float',
        'EXT_texture_filter_anisotropic',
        'EXT_blend_minmax',
        'WEBGL_depth_texture',
      ],
      profile: true,
      onDone: (err: Error | null, r?: regl.Regl | undefined): void => {
        if (err || !r) {
          console.error(err)
        } else {
          callBack && callBack()
        }
      },
    })
  }

  public getDrawCall(drawOptions) {
    return this.gl(drawOptions)
  }

  public getPointSizeRange() {
    return this.gl._gl.getParameter(this.gl._gl.ALIASED_POINT_SIZE_RANGE)
  }

  public testExtension(name: string) {
    // OES_texture_float
    return !!this.getGLContext().getExtension(name)
  }

  // @ts-ignore
  public getDrawCommand = (options: IModelOptions) => this.gl(options)

  public createFramebuffer = (options: regl.FramebufferOptions) => this.gl.framebuffer(options)

  public createTexture2D = (options: regl.Texture2DOptions) => this.gl.texture(options)

  public useFramebuffer = (framebuffer: regl.Framebuffer | null, drawCommands: () => void) => {
    this.gl({ framebuffer })(drawCommands)
  }

  public clear = (options: regl.ClearOptions) => {
    this.gl?.clear(options)
  }

  public viewport = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
    // use WebGL context directly https://github.com/regl-project/regl/blob/gh-pages/API.md#unsafe-escape-hatch
    this.gl._gl.viewport(x, y, width, height)
    this.width = width
    this.height = height
    this.gl._refresh()
  }

  public readPixels = (options: regl.ReadOptions) => {
    return this.gl.read(options)
  }

  public getViewportSize = () => {
    return {
      width: this.gl._gl.drawingBufferWidth,
      height: this.gl._gl.drawingBufferHeight,
    }
  }

  // public getGL = () => {
  //   return this.gl
  // }

  public getGLContext = () => {
    return this.gl._gl
  }

  public getCanvas = () => {
    return this.canvas
  }

  // public setState() {
  //   this.gl({
  //     cull: {
  //       enable: false,
  //       face: 'back',
  //     },
  //     viewport: {
  //       x: 0,
  //       y: 0,
  //       height: this.width,
  //       width: this.height,
  //     },
  //     blend: {
  //       enable: true,
  //       equation: 'add',
  //     },
  //     framebuffer: null,
  //   })
  //   this.gl._refresh()
  // }
  public setCustomLayerDefaults() {
    const gl = this.getGLContext()
    gl.disable(gl.CULL_FACE)
  }

  public createReglModel(options: IModelOptions) {
    return new ReglModel(this.gl, options)
  }

  public destroy = () => {
    // make sure release webgl context
    this.gl?._gl?.getExtension('WEBGL_lose_context')?.loseContext()

    // @see https://github.com/regl-project/regl/blob/gh-pages/API.md#clean-up
    this.gl.destroy()

    // @ts-ignore
    this.gl = null
  }
}
