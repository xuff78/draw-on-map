import WebMercatorViewport from 'viewport-mercator-project'
import { getDistanceScales, zoomToScale } from './project'
import * as mat4 from 'gl-matrix/mat4'
import * as vec4 from 'gl-matrix/vec4'

export function getProjectUniforms(gl, cameraPosition) {
  const { zoom, bearing, pitch, center } = cameraPosition
  // const bearing = map.getBearing()
  // const pitch = map.getPitch()
  // const center = map.getCenter()

  let scale = 100 / detectZoom()
  const params = {
    width: gl.drawingBufferWidth * scale,
    height: gl.drawingBufferHeight * scale,
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom,
    pitch,
    bearing,
  }
  // console.log('params', params)
  const viewport = new WebMercatorViewport(params)
  // console.log('viewport', viewport.projectFlat([120.11, 28.11]))
  // @ts-ignore
  const { width, height, viewProjectionMatrix, projectionMatrix, viewMatrix, viewMatrixUncentered } = viewport
  // console.log('viewport', viewport)
  const devicePixelRatio = window.devicePixelRatio
  const viewportSize = [width * devicePixelRatio, height * devicePixelRatio]
  let drawParams = {
    // @ts-ignore
    u_matrix: viewProjectionMatrix,
    u_is_offset: false,
    u_pixels_per_degree: [0, 0, 0],
    u_pixels_per_degree2: [0, 0, 0],
    u_viewport_center: [0, 0],
    u_pixels_per_meter: [0, 0, 0],
    u_project_scale: zoomToScale(zoom),
    u_viewport_center_projection: [0, 0, 0, 0],
    u_viewport_size: viewportSize,
  }

  if (zoom > 12) {
    const { pixelsPerDegree, pixelsPerDegree2 } = getDistanceScales({
      longitude: center.lng,
      latitude: center.lat,
      zoom: zoom,
      highPrecision: true,
    })
    const positionPixels = viewport.projectFlat([Math.fround(center.lng), Math.fround(center.lat)], Math.pow(2, zoom))
    const projectionCenter = vec4.transformMat4(
      [],
      [positionPixels[0], positionPixels[1], 0.0, 1.0],
      viewProjectionMatrix,
    )
    let viewMatrix2 = viewMatrixUncentered || viewMatrix
    let viewProjectionMatrix2 = mat4.multiply([], projectionMatrix, viewMatrix2)
    const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
    viewProjectionMatrix2 = mat4.multiply([], viewProjectionMatrix2, VECTOR_TO_POINT_MATRIX)
    drawParams['u_matrix'] = viewProjectionMatrix2
    drawParams['u_is_offset'] = true
    drawParams['u_viewport_center'] = [Math.fround(center.lng), Math.fround(center.lat)]
    drawParams['u_viewport_center_projection'] = projectionCenter
    drawParams['u_pixels_per_degree'] = pixelsPerDegree && pixelsPerDegree.map((p) => Math.fround(p))
    drawParams['u_pixels_per_degree2'] = pixelsPerDegree2 && pixelsPerDegree2.map((p) => Math.fround(p))
  }

  return drawParams
}

function detectZoom() {
  let ratio = 100,
    screen = window.screen,
    ua = navigator.userAgent.toLowerCase()

  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio
  } else if (~ua.indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI
    }
  } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
    ratio = window.outerWidth / window.innerWidth
  }

  if (ratio) {
    ratio = Math.round(ratio * 100)
  }

  return ratio
}
