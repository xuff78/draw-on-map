<template>
  <div class="full-content">
    <map-view @handle-get-map="handleGetMap" />
  </div>
</template>
<script setup name="line">
import MapKit from '#'
import axios from 'axios'
import { multiarr } from '../../utils'
const allcolors = ['#1068BF', '#FFA500', '#00964f', '#4D26BF', '#FF8C69', '#666666', '#CDAF95', '#FF7364', '#2EB8B8']
let map
const handleGetMap = async (mapValue) => {
  map = mapValue

  const layer = new MapKit.LineLayer(map, {
    zIndex: 11,
    hover: { useMouseHover: true, hoverColor: '#ff0000', hoverMouseStyle: 'pointer', hoverOpacity: 0.5 },
    bolderWidth: 0.2,
  })

  const result = await axios.get(`/data/carPath.json`)
  const fs = result.data
  console.log('lines', fs)
  const lines = fs.map((item, index) => getLine(item, index))
  layer.setData(lines)
  map.fitMap(lines, [30, 30, 100, 100])
}

const getLine = (f, index) => {
  const coords = f.geometry.coordinates
  // console.log('num', multiarr(coords))
  const polyline = new MapKit.Line({
    coords: multiarr(coords) === 3 ? coords[0] : coords[0][0],
    strokeWeight: 5, // 线条宽度，默认为 1
    strokeColor: allcolors[index % 9], // 线条颜色
    lineJoin: 'miter', // 折线拐点连接处样式 round, miter
    strokeStyle: 'solid', // 实线:solid，虚线:dashed
    outlineColor: '#fff',
    outlineWidth: 1,
  })
  return polyline
}
</script>

<style scoped></style>
