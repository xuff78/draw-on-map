import regl from 'regl'
import { IModelOptions } from '#/renderer/interface'

export default class ReglModel {
  private options: IModelOptions
  private gl: regl.Regl
  constructor(gl: regl.Regl, options: IModelOptions) {
    this.gl = gl
    this.options = options
    if (this.options.attributes instanceof Array) {
      this.options.attributes = this.getArrayProps(this.options.attributes)
    }
    if (this.options.uniforms && this.options.uniforms instanceof Array) {
      this.options.uniforms = this.getArrayProps(this.options.uniforms)
    }
    if (typeof this.options.elements === 'string') {
      // @ts-ignore
      this.options.elements = this.gl.prop(this.options.elements)
    }
    if (!this.options.uniforms) {
      this.options.uniforms = []
    }
    this.setProjectUniform()
    this.setPickUniform()
  }

  getDrawOptions(): IModelOptions {
    return this.options
  }

  setPickUniform() {
    const keys = ['u_for_fbo', 'u_use_highlight', 'u_highlight_color', 'u_highlight_id']
    if (this.options.pick) {
      const projectUniform = this.getArrayProps(keys)
      this.options.uniforms = {
        ...this.options.uniforms,
        ...projectUniform,
      }
    }
  }
  setProjectUniform() {
    const keys = [
      'u_matrix',
      'u_is_offset',
      'u_pixels_per_degree',
      'u_pixels_per_degree2',
      'u_viewport_center',
      'u_pixels_per_meter',
      'u_project_scale',
      'u_viewport_center_projection',
      'u_viewport_size',
    ]
    const projectUniform = this.getArrayProps(keys)
    this.options.uniforms = {
      ...this.options.uniforms,
      ...projectUniform,
    }
  }

  public getArrayProps(keys: string[]): { [key: string]: any } {
    const props = {}

    for (const key of keys) {
      // @ts-ignore
      props[key] = this.gl.prop(key)
    }
    return props
  }
}
