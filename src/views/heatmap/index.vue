<template>
  <div class="full-content">
    <map-view @handle-get-map="handleGetMap" />
  </div>
</template>
<script setup name="heatmap">
import MapKit from '#'
import axios from 'axios'
let map
const handleGetMap = async (mapValue) => {
  map = mapValue
  addHeatmap()
}

const addHeatmap = async () => {
  const result = await axios.get(`/data/geojson.json`)
  const listFs = result.data.features
  // console.log('list', list)
  const points = []
  for (let i = 0; i < 3000; i++) {
    const f = listFs[i]
    points.push([...f.geometry.coordinates, f.properties.mag])
  }
  const layer = new MapKit.HeatmapLayer(map, {
    zIndex: 11,
    hover: true,
  })
  layer.setData(points)
  map.fitMap(listFs.slice(0, 3000), [30, 30, 0, 0])
}
</script>

<style scoped></style>
