<template>
  <div class="map-commen--box">
    <div id="mapContainer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, onActivated } from 'vue'
import MapKit from '#'
const flagShow = ref(false)
const props = defineProps({
  pitchEnable: {
    type: Boolean,
    default: true,
  }
})
let map = null
const emit = defineEmits(['handleGetMap'])
onMounted(() => {
  MapKit.init('mapContainer', {
    // style: 'https://maptile-style.langgemap.com/maptile-conf/styles/fresh/style.json',
    zoom: 12,
    pitchWithRotate: props.pitchEnable,
    dragRotate: true,
  }, (map) => {
    flagShow.value = true
    emit('handleGetMap', map)
  })
})
onActivated(() => {
  map && map.resize()
})
</script>

<style lang="scss" scoped>
:deep(.marker-popup) {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 7px 18px;
  position: absolute;
  top: -42px;
  left: 50%;
  border-radius: 4px;
  white-space: nowrap;
  text-align: center;
  transform: translate(-50%);
  .close_btn {
    display: block;
    position: absolute;
    right: 4px;
    top: 2px;
    display: block;
    font-size: 12px;
    line-height: 12px;
    cursor: pointer;
  }
}
:deep(.mapboxgl-popup-content) {
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 10px 15px;
  .mapboxgl-popup-close-button {
    color: #fff;
    outline: none;
    padding: 2px;
  }
}
:deep(.mapboxgl-popup-tip) {
  border-top-color: rgba(0, 0, 0, 0.8) !important;
}
:deep(.marker-popup > .popper-arrow) {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
  bottom: -5px;
  left: calc(50% - 5px);
  margin-right: 3px;
  border-top-color: rgba(0, 0, 0, 0.6);
  border-bottom-width: 0;
}
:deep(.marker-popup > .popper-arrow:after) {
  content: ' ';
  border-width: 6px;
  bottom: 1px;
  margin-left: -6px;
  border-top-color: #fff;
  border-bottom-width: 0;
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.map-commen--box {
  width: 100%;
  height: 100%;
  position: relative;
  #mapContainer {
    width: 100%;
    height: 100%;
  }
}
</style>
