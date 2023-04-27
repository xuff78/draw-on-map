import { createUUID } from '#/utils'
import { LayerOptions } from '#/layer/interface'
import { ReglRendererService } from '#/renderer'
import { encodePickingColor, hexToRgb } from '#/utils/color'
import { MapServices } from '#/services'
import { getProjectUniforms } from '#/core/project/uniform'
import { IModelOptions } from '#/renderer/interface'
export default class BaseModel {
  id: string = 'customLayer-' + createUUID()
  hlc: number[] = [0, 0, 0, 0]
  pickId: number[] = [-1, -1, -1]
  options: LayerOptions
  sdkRenderer: ReglRendererService
  mapServices: MapServices
  indexBuffer: any[] = []
  attributes: { [key: string]: any } = {}
  supportPick: boolean | undefined
  protected constructor(mapServices: MapServices) {
    if (!mapServices) {
      throw new Error('需要先执行初始化init')
    }
    this.mapServices = mapServices
    this.sdkRenderer = this.mapServices.sdkRenderer
    this.options = {
      zooms: [3, 18],
      zIndex: 10,
      hover: { useMouseHover: false },
    }
  }
  getDrawCommand(modelOptions: IModelOptions) {
    const model = this.sdkRenderer.createReglModel(modelOptions)
    const drawOptions: IModelOptions = model.getDrawOptions()
    this.supportPick = modelOptions.pick
    delete modelOptions.pick
    return this.sdkRenderer.getDrawCommand(drawOptions)
  }
  getId(): string {
    return this.id
  }
  setOptions(opts: LayerOptions) {
    this.options = opts
    if (opts.hover.hoverColor) {
      this.hlc = hexToRgb(opts.hover.hoverColor, opts.hover.hoverOpacity || 1)
    }
  }
  onRemove() {
    console.log('remove')
  }
  setPickId(id: number) {
    this.pickId = id === null ? [-1, -1, -1] : encodePickingColor(id)
  }
  getBufferProps(usePickFBO = false) {
    const projectUniforms = getProjectUniforms(this.sdkRenderer.getGLContext(), this.mapServices.getCameraPosition())
    const props = {
      ...this.attributes,
      indexBuffer: this.indexBuffer,
      ...projectUniforms,
    }
    if (this.supportPick) {
      const pickProps = {
        u_for_fbo: usePickFBO,
        u_use_highlight: this.options.hover.useMouseHover,
        u_highlight_color: this.hlc,
        u_highlight_id: this.pickId,
      }
      Object.assign(props, pickProps)
    }
    return props
  }
}
