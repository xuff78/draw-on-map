import ShapeLayer from '#/layer/ShapeLayer'
import PolygonLayer from '#/layer/PolygonLayer'
import LineLayer from '#/layer/LineLayer'
import MassLayer from '#/layer/MassLayer'
import { MapServices } from '#/services'
import ShapePoint from '#/obj/shape'
import Polygon from '#/obj/polygon'
import Line from '#/obj/line'
import Map from '#/services/map'
import HeatmapLayer from '#/layer/HeatmapLayer'

function init(id: string, options, cb) {
  const map = new Map(id, options,  () => {
    map.MapKitServices = new MapServices(map)
    cb && cb.call(window, map)
  })
}

export default {
  ShapePoint,
  Polygon,
  Line,
  MassLayer,
  HeatmapLayer,
  ShapeLayer,
  PolygonLayer,
  LineLayer,
  init,
}
