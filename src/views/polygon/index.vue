<template>
  <div class="full-content">
    <map-view @handle-get-map="handleGetMap" />sa
  </div>
</template>
<script setup name="polygon">
import MapKit from '#'
import axios from 'axios'
import { multiarr } from '../../utils'
const allcolors = ['#1068BF', '#FFA500', '#00964f', '#4D26BF', '#FF8C69', '#666666', '#CDAF95', '#FF7364', '#2EB8B8']
let map
const handleGetMap = async (mapValue) => {
  map = mapValue

  const layer = new MapKit.PolygonLayer(map, {
    zIndex: 11,
    hover: { useMouseHover: true, hoverColor: '#ff0000', hoverMouseStyle: 'pointer', hoverOpacity: 0.5 },
  })

  const result = await axios.get(`/data/carPath.json`)
  const fs = result.data
  // console.log('fs', fs)
  const lines = fs.map((item, index) => getPolygon(item, index))
  // console.log('lines', lines)
  layer.setData(lines)
  map.fitMap(lines, [30, 30, 100, 100])
}

const getPolygon = (f, index) => {
  const coords = f.geometry.coordinates
  const polygon = new MapKit.Polygon({
    coords: multiarr(coords) === 3 ? coords[0] : coords[0][0],
    strokeWeight: 2, // 线条宽度，默认为 1
    strokeColor: allcolors[index % 9], // 线条颜色
    lineJoin: 'miter', // 折线拐点连接处样式 round, miter
    strokeStyle: 'solid', // 实线:solid，虚线:dashed
    fillColor: allcolors[index % 9], // 填充色
    fillOpacity: 0.2, // 填充透明度

  })
  return polygon
}
</script>

<style scoped></style>
