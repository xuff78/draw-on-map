import VectorObject from "#/obj/vector-object";
import {getArrayLevel} from "#/utils";

class Polygon extends VectorObject {
    constructor(options = {}) {
        super('Polygon', options)
        this.setPathHandle(this.lineHandle.bind(this))
    }

    lineHandle(coords) {
        const depth = getArrayLevel(coords)
        if (depth === 2) {
            coords = [coords]
        }
        this.checkCoordinates(coords)
        return coords
    }

    /**
     * 校验首坐标是否与尾坐标相同，不同补齐
     * @param {Array} paths
     */
    checkCoordinates(paths) {
        let isCoordinates = false
        paths.forEach(path => {
            const prototype = Object.prototype.toString.call(path)
            if (prototype === '[object Array]') {
                const item = path.find(item => Object.prototype.toString.call(item) !== '[object Array]')
                if (item) {
                    isCoordinates = true
                } else {
                    this.checkCoordinates(path)
                }
            }
        })
        if (isCoordinates) {
            const start = JSON.stringify(paths[0])
            const end = JSON.stringify(paths[paths.length - 1])
            if (start !== end) {
                paths.push(JSON.parse(start))
            }
        }
    }
}

export default Polygon