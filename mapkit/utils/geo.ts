import {number} from "vue-types";

export function aProjectFlat(lnglat: number[]) {
  const maxs = 85.0511287798
  const lat = Math.max(Math.min(maxs, lnglat[1]), -maxs)
  const scale = 256 << 20
  let d = Math.PI / 180
  let x = lnglat[0] * d
  let y = lat * d
  y = Math.log(Math.tan(Math.PI / 4 + y / 2))

  const a = 0.5 / Math.PI
  const b = 0.5
  const c = -0.5 / Math.PI
  d = 0.5
  x = scale * (a * x + b)
  y = scale * (c * y + d)
  return [Math.floor(x), Math.floor(y)]
}

/**
 * 获取GeoJSON的数据范围
 * @param geojson
 * @returns {*}
 */
export const getExtent = function (geojson) {
  let coords: number[][] = []
  const extent = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY
  ]
  if (!geojson.hasOwnProperty('type')) return
  coords = getCoordinatesLoop(geojson)
  return coords.reduce(function (prev, coord) {
    return [
      Math.min(coord[0], prev[0]),
      Math.min(coord[1], prev[1]),
      Math.max(coord[0], prev[2]),
      Math.max(coord[1], prev[3])
    ]
  }, extent)
}

/**
 * 循环存取坐标
 * @param geojson
 * @returns {*}
 */
const getCoordinatesLoop = (geojson) => {
  let coords
  if (geojson.type === 'Point') {
    coords = [geojson.coordinates]
  } else if (geojson.type === 'LineString' || geojson.type === 'MultiPoint') {
    coords = geojson.coordinates
  } else if (geojson.type === 'Polygon' || geojson.type === 'MultiLineString') {
    coords = geojson.coordinates.reduce(function (dump, part) {
      return dump.concat(part)
    }, [])
  } else if (geojson.type === 'MultiPolygon') {
    coords = geojson.coordinates.reduce(function (dump, poly) {
      return dump.concat(poly.reduce(function (points, part) {
        return points.concat(part)
      }, []))
    }, [])
  } else if (geojson.type === 'Feature') {
    coords = getCoordinatesLoop(geojson.geometry)
  } else if (geojson.type === 'GeometryCollection') {
    coords = geojson.geometries.reduce(function (dump, g) {
      return dump.concat(getCoordinatesLoop(g))
    }, [])
  } else if (geojson.type === 'FeatureCollection') {
    coords = geojson.features.reduce(function (dump, f) {
      return dump.concat(getCoordinatesLoop(f))
    }, [])
  }
  return coords
}