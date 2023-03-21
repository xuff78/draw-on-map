import { createUUID } from '#/utils'
import {GeometryType, ObjType, Properties, Property} from "#/obj/property-map";

/**
 * 点线面等矢量图形的基础类
 */
class VectorObject {
    pickId: number = -1
    updateObject: ((VectorObject) => void) | undefined
    private readonly _id: string;
    private readonly type: ObjType;
    private _options: {[key: string]: string | number}
    private pathHandle: ((coords) => {}) | undefined
    constructor(type: ObjType, options) {
        this.type = type
        this._id = createUUID(16)
        this.checkOptions(options)
        this._options = options
    }

    checkOptions(options) {
        const properties = [{key: 'coords', request: true}, ...Properties[this.type]]
        properties.forEach((item: Property) => {
            const userDefine = options[item.key]
            if (item.request && userDefine === undefined) {
                throw new Error('options 需要设置 ' + item.key)
            }
        })
    }

    getId() {
        return this._id
    }

    /** 未完成 */
    setOptions(options) {
        this._options = Object.assign(this._options, options)
    }

    getOptions() {
        return this._options
    }

    removeFromLayer() {
        this.updateObject = undefined
    }

    getObjectType() {
        return this.type
    }

    setExtData(ext) {
        this._options.extData = ext
    }

    getExtData() {
        return this._options.extData
    }

    setPathHandle(pathHandle) {
        this.pathHandle = pathHandle
    }

    getGeojson() {
        const properties = Properties[this.type]
        let feature = {
            'type': 'Feature',
            'geometry': {
                'type': GeometryType[this.type],
                'coordinates': this.pathHandle ? this.pathHandle(this._options.coords) : this._options.coords,
            },
            'properties': {
                'id': this.getId(),
            },
        }
        properties.forEach((item: Property) => {
            const userDefine = this._options[item.key]
            if (userDefine !== undefined) {
                feature.properties[item.key] = userDefine
            } else if (!item.request && item.defaultValue !== undefined) {
                feature.properties[item.key] = item.defaultValue
            }
        })
        return feature
    }
}

export default VectorObject
