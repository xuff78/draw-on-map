<template>
  <div class="full-content">
    <map-view @handle-get-map="handleGetMap" />
  </div>
</template>
<script setup name="mass">
import MapKit from '#'
import axios from 'axios'
let map
const handleGetMap = async (mapValue) => {
  map = mapValue
  addSDF()
}

const addSDF = async () => {
  const result = await axios.get(`/data/geojson.json`)
  const listFs = result.data.features
  // console.log('list', list)
  const points = []
  for (let i = 0; i < 100000; i++) {
    const f = listFs[i]
    points.push({ lngLat: f.geometry.coordinates, name: 'point: ' + i })
  }
  const list = [
    {url: '/icon/icon_building.png', size: 30, points: points.slice(0, 25000)},
    {url: '/icon/icon_flower.png', size: 30, points: points.slice(25000, 50000)},
    {url: '/icon/icon_location.png', size: 30, points: points.slice(50000, 75000)},
    {url: '/icon/icon_fav.png', size: 25, points: points.slice(75000, 100000)}
  ]
  const layer = new MapKit.MassLayer(map, {
    zIndex: 11,
    hover: true,
  })
  layer.setData(list)
  map.fitMap(listFs.slice(0, 30000), [30, 30, 0, 0])
  layer.on('mousemove', (e) => {
    console.log('mouseenter', e)
  })
  layer.on('mouseout', () => {
    console.log('mouseleave')
  })
}
</script>

<style scoped></style>
