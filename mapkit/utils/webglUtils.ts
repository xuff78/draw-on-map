import { projectInsert } from '#/core/glsl/project'
import { pick_vs, pick_fs } from '#/core/glsl/pick'
const pragma = '#pragma include '
const codeVS = {
  project_vs: projectInsert,
  picking_vs: pick_vs,
}
const codeFS = {
  picking_fs: pick_fs,
}

function getGSLSSource(vertexSource: string, fragmentSource: string) {
  let vert = vertexSource,
    frag = fragmentSource
  for (const key in codeVS) {
    vert = vert.replace(`${pragma}${key}`, codeVS[key])
  }
  for (const key in codeFS) {
    frag = frag.replace(`${pragma}${key}`, codeFS[key])
  }
  return {
    vert,
    frag,
  }
}

export { getGSLSSource }
