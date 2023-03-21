<template>
  <div class="full-content">
    <map-view :pitchEnable="false" @handle-get-map="handleGetMap" />
  </div>
</template>
<script setup name="sdf">
import MapKit from '#'
import axios from 'axios'
import bearing from '@turf/bearing'
import { point as toPoint } from '@turf/helpers'
const allcolors = ['#1068BF', '#FFA500', '#00964f', '#4D26BF', '#FF8C69', '#666666', '#CDAF95', '#FF7364', '#2EB8B8']
let map
const handleGetMap = async (mapValue) => {
  map = mapValue
  addSDF()
}

const addSDF = async () => {
  const layer = new MapKit.ShapeLayer(map, {
    zIndex: 11,
    hover: { useMouseHover: true, hoverColor: '#ff0000', hoverMouseStyle: 'pointer', hoverOpacity: 0.5 },
  })
  const lineLayer = new MapKit.LineLayer(map, { zIndex: 10 })

  const result = await axios.get(`/data/city_trips.json`)
  const tracks = result.data
  const allPoint = []
  const allLine = []
  tracks.forEach((track, index) => {

    let angle = 0
    const orderNum = track.path.length
    const color = allcolors[index % 9]
    const path  = track.path
    const points = path.map((point, i) => {
      let startPoint, endPoint
      if (orderNum !== 1) {
        if (i === 0) {
          startPoint = path[i]
          endPoint = path[i + 1]
        } else {
          startPoint = path[i - 1]
          endPoint = path[i]
        }
        angle = bearing(toPoint(startPoint), toPoint(endPoint))
      }
      return getPoint(point, color, index % 4, Math.floor(angle))
    })
    allPoint.push(...points)
    allLine.push(getLine(track.path, color))
  })
  lineLayer.setData(allLine)
  layer.setData(allPoint)
  map.fitMap(allPoint, [200, 200, 200, 200])

  layer.on('click', (e) => {
    console.log('click', e)
  })
}
const getPoint = (point, color, type, angle) => {
  const mapPoint = new MapKit.ShapePoint({
    coords: point,
    fillColor: color,
    fillOpacity: 1,
    radius: 12,
    strokeWidth: 3,
    strokeColor: '#ffffff',
    strokeOpacity: 1,
    angle: angle,
    shapeType: type,
  })
  return mapPoint
}
const getLine = (coords, color) => {
  const polyline = new MapKit.Line({
    coords: coords,
    strokeWeight: 10, // 线条宽度，默认为 1
    strokeColor: color, // 线条颜色
    strokeOpacity: 0.3,
    lineJoin: 'miter', // 折线拐点连接处样式 round, miter
    strokeStyle: 'solid', // 实线:solid，虚线:dashed
  })
  return polyline
}
</script>

<style scoped></style>
