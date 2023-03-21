interface Property {
    key: string
    request: boolean
    defaultValue?: any
}

const GeometryType = {
    Shape: 'Point',
    Point: 'Point',
    Line: 'LineString',
    Polygon: 'Polygon',
}
type ObjType = 'Shape' | 'Point' | 'Line' | 'Polygon'
const Properties = {
    Point: [
        {key: 'icon', request: true},
        {key: 'anchor', request: false, defaultValue: 'center'},
        {key: 'iconSize', request: false},
        {key: 'textSize', request: false, defaultValue: '12'},
        {key: 'bearing', request: false, defaultValue: 0},
        {key: 'textColor', request: false, defaultValue: '#000000'},
        {key: 'offset', request: false, defaultValue: [0, 0]},
        {key: 'textOffset', request: false, defaultValue: [0, 0]},
        {key: 'textAnchor', request: false, defaultValue: 'center'},
        {key: 'textHaloColor', request: false, defaultValue: '#ffffff'},
    ],
    Shape: [
        {key: 'strokeColor', request: false, defaultValue: '#000000'},
        {key: 'strokeWeight', request: false, defaultValue: 2},
        {key: 'strokeOpacity', request: false, defaultValue: 1},
        {key: 'fillColor', request: false, defaultValue: '#000000'},
        {key: 'fillOpacity', request: false, defaultValue: 1},
        {key: 'radius', request: true},
        {key: 'angle', request: false, defaultValue: 0},
        {key: 'shapeType', request: false, defaultValue: 0},
    ],
    Polygon: [
        {key: 'strokeColor', request: false, defaultValue: '#000000'},
        {key: 'strokeWeight', request: false, defaultValue: 2},
        {key: 'strokeOpacity', request: false, defaultValue: 1},
        {key: 'fillColor', request: false, defaultValue: '#000000'},
        {key: 'fillOpacity', request: false, defaultValue: 1},
        {key: 'lineJoin', request: false, defaultValue: 'round'},
    ],
    Line: [
        {key: 'strokeColor', request: false, defaultValue: '#000000'},
        {key: 'strokeWeight', request: false, defaultValue: 2},
        {key: 'strokeOpacity', request: false, defaultValue: 1},
        {key: 'strokeStyle', request: false, defaultValue: '#000000'},
        {key: 'lineCap', request: false, defaultValue: 'miter'},
        {key: 'lineJoin', request: false, defaultValue: 'round'},
        {key: 'direction', request: false},
    ]
}

export { type Property, GeometryType, type ObjType, Properties }