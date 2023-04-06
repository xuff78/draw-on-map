import { getExtent } from '#/utils/geo'
// import { loadImgs } from '../utils/images'
import VectorObject from '../obj/vector-object'

window.mapboxgl.accessToken = 'pk.eyJ1IjoieHV5aWNoYW8xMjM0IiwiYSI6ImNqeDVod2IwZjAyNXg0YXBvdWJkcXVuejIifQ.EMtViDDUKAhPAD9bnOdBfA'
const defaultOptions = {
    zoom: 11, //初始化地图层级
    maxZoom: 18,
    minZoom: 3,
    center: [116.403909, 39.91416], //初始化地图中心点
    scrollWheel: true,
    attributionControl: false,
    localIdeographFontFamily: 'Arial',
    pitchWithRotate: false,
    dragRotate: false,
    touchZoomRotate: false,
    touchPitch: false,
    fadeDuration: 0,
}

class Map extends window.mapboxgl.Map {
    constructor(id: string, options = {}, onLoad?) {
        console.log('id', id)
        let mapOptions = Object.assign({}, defaultOptions, {
            container: id,
            zoom: 3.6,
            style: 'mapbox://styles/mapbox/light-v10',
            pitch: 0,
        }, options)
        // console.log('!!!!!', mapOptions)
        super(mapOptions)
        this.touchZoomRotate.disableRotation()
        this.containerID = mapOptions.container
        this.on('load', () => {
            this.scrollZoom.setWheelZoomRate(1 / 150)
            this.scrollZoom.setZoomRate(1 / 150)
            if (typeof onLoad === 'function') {
                onLoad()
            }
        })
    }

    flyToCenter (position, zoom) {
        let CameraOptions = {
            center: position,
            zoom: zoom ? zoom : this.getZoom()
        }
        this.flyTo(CameraOptions)
    }

    jumpToCenter (position, zoom) {
        let CameraOptions = {
            center: position,
            zoom: zoom ? zoom : this.getZoom()
        }
        this.jumpTo(CameraOptions)
    }

    lnglat2container (lnglat = [0, 0]) {
        let point = this.project(lnglat)
        return [Number(point.x.toFixed(2)), Number(point.y.toFixed(2))]
    }

    container2lnglat (point = [0, 0]) {
        let lnglat = this.unproject(point);
        return [Number(lnglat.lng.toFixed(7)), Number(lnglat.lat.toFixed(7))]
    }

    fitMap (list, padding = [0, 0, 0, 0], flyTo) {
        let geoJson: any = {
            type: 'FeatureCollection',
            features: []
        }
        if (list instanceof Array) {
            list.forEach(obj => {
                if (obj instanceof VectorObject) {
                    geoJson.features.push(obj.getGeojson())
                } else {
                    geoJson.features = list
                }
            })
        }
        if (geoJson.features.length === 0) return
        // console.log('geoJson.features', geoJson.features)
        const bounds = getExtent(geoJson)
        const camera = this.cameraForBounds(bounds, {
            padding: {
                top: padding[0] + 40,
                bottom: padding[1] + 40,
                left: padding[2] + 20,
                right: padding[3] + 20
            }
        })
        if (!flyTo) {
            this.jumpTo(camera)
        } else {
            this.flyTo(camera)
        }
    }

    destroy () {
        super.remove();
    }

    // addMapImages (imgList = []) {
    //     return loadImgs(this, imgList)
    // }

    setMouseStyle (type) {
        this.getCanvas().style.cursor = type
    }
}

export default Map
