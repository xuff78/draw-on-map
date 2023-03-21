import { Position } from '@turf/helpers'
import {getArrayLevel} from "#/utils";
export type Triangulation = (
  feature: Position,
  segmentNumber?: number,
) => {
  vertices: number[]
  indices: number[]
  size: number
  normals?: number[]
  indexes?: number[]
  count?: number
}

export function createAttributesAndIndices(features: any, triangulation: Triangulation) {
  let verticesNum = 0
  let vecticesCount = 0 // 在不使用 element 的时候记录顶点、图层所有顶点的总数
  const dataList: any[] = []
  const vertices: number[] = []
  const indices: number[] = []
  const normals: number[] = []
  let size = 3
  features.forEach((feature, featureIdx) => {
    // 逐 feature 进行三角化
    let coordinates = feature.geometry.coordinates
    if (getArrayLevel(coordinates) === 2) {
      coordinates = [coordinates]
    }
    coordinates.forEach(line => {
      const coords = line.reduce((prev, cur) => {
        prev.push([Math.fround(Number(cur[0])), Math.fround(Number(cur[1]))])
        return prev
      }, [])
      const {
        indices: indicesForCurrentFeature,
        vertices: verticesForCurrentFeature,
        normals: normalsForCurrentFeature,
        size: vertexSize,
        indexes,
        count,
      } = triangulation(coords)

      if (typeof count === 'number') {
        vecticesCount += count
      }

      indicesForCurrentFeature.forEach((i) => {
        indices.push(i + verticesNum)
      })
      size = vertexSize
      const verticesNumForCurrentFeature = verticesForCurrentFeature.length / vertexSize

      verticesNum += verticesNumForCurrentFeature
      // 根据 position 顶点生成其他顶点数据
      for (let vertexIdx = 0; vertexIdx < verticesNumForCurrentFeature; vertexIdx++) {
        const normal = normalsForCurrentFeature?.slice(vertexIdx * 3, vertexIdx * 3 + 3) || []
        const vertice = verticesForCurrentFeature.slice(vertexIdx * vertexSize, vertexIdx * vertexSize + vertexSize)

        let vertexIndex = 0
        if (indexes && indexes[vertexIdx] !== undefined) {
          vertexIndex = indexes[vertexIdx]
        }
        dataList.push({
          feature,
          featureIdx,
          vertice,
          vertexIdx, // 当前顶点所在feature索引
          normal,
          vertexIndex,
          // 传入顶点索引 vertexIdx
        })
      }
    })
  })

  return {
    indices,
    attr: dataList,
  }
}
