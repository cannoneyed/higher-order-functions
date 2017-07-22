import * as THREE from 'three'
import _ from 'lodash'
import colorMap from 'constants/colors'
import data from 'data/data.json'

const threeColorsByIndex = _.map(colorMap, (colorString, colorIndex) => {
  return new THREE.Color(getHexColorByIndex(colorIndex))
})

const N_GROUPS = 3
const MAGIC_NUMBER = 551
let PIXEL_SIZE = 10

const centerRow = 132
const centerCol = 76

// Make more groups for white (colorIndex === 0)
const getNGroups = colorIndex =>
  colorIndex * 1 === 0 ? N_GROUPS * 3 : N_GROUPS

export default class PixelManager {
  constructor(renderer) {
    const countsByColor = {}
    _.map(data, (row, rowIndex) => {
      _.map(row, (color, colIndex) => {
        const colorIndex = parseInt(color, 16)
        countsByColor[colorIndex] = countsByColor[colorIndex] || 0
        countsByColor[colorIndex] += 1
      })
    })

    this.bufferGeometries = _.map(countsByColor, (count, colorIndex) => {
      return _.range(getNGroups(colorIndex)).map(() => ({
        geometry: new THREE.BufferGeometry(),
        positions: [],
        colors: [],
        normals: [],
      }))
    })

    this.pixelGroups = []
    this.renderer = renderer
    this.initializeRenderer()

    this.addColorVertices()
    this.createBufferGeometries()
  }

  initializeRenderer = () => {
    PIXEL_SIZE = 2 * this.renderer.getSize().height / data.length
  }

  getBufferGeometry(colorIndex, groupIndex) {
    return this.bufferGeometries[colorIndex][groupIndex]
  }

  addColorVertex = (colorIndex, rowIndex, colIndex, vertex) => {
    // Pseudo hashing function to assign a vertex to a particle group
    const calc = rowIndex + colIndex + rowIndex * rowIndex * colIndex
    const groupNumber = (calc >> MAGIC_NUMBER) % (getNGroups(colorIndex) - 1) // eslint-disable-line no-bitwise

    let bufferGeometry = this.getBufferGeometry(colorIndex, groupNumber)

    // If we're the centered on white pixel, force it into group [0, 0]
    if (rowIndex === centerRow && colIndex === centerCol) {
      bufferGeometry = this.getBufferGeometry(0, 0)
    }

    const color = getColorByIndex(colorIndex)
    const geometry = new THREE.PlaneGeometry(PIXEL_SIZE, PIXEL_SIZE)
    geometry.translate(vertex.x, vertex.y, vertex.z)

    geometry.faces.forEach(function(face, index) {
      bufferGeometry.positions.push(geometry.vertices[face.a].x)
      bufferGeometry.positions.push(geometry.vertices[face.a].y)
      bufferGeometry.positions.push(geometry.vertices[face.a].z)
      bufferGeometry.positions.push(geometry.vertices[face.b].x)
      bufferGeometry.positions.push(geometry.vertices[face.b].y)
      bufferGeometry.positions.push(geometry.vertices[face.b].z)
      bufferGeometry.positions.push(geometry.vertices[face.c].x)
      bufferGeometry.positions.push(geometry.vertices[face.c].y)
      bufferGeometry.positions.push(geometry.vertices[face.c].z)
      bufferGeometry.normals.push(face.normal.x)
      bufferGeometry.normals.push(face.normal.y)
      bufferGeometry.normals.push(face.normal.z)
      bufferGeometry.normals.push(face.normal.x)
      bufferGeometry.normals.push(face.normal.y)
      bufferGeometry.normals.push(face.normal.z)
      bufferGeometry.normals.push(face.normal.x)
      bufferGeometry.normals.push(face.normal.y)
      bufferGeometry.normals.push(face.normal.z)
      bufferGeometry.colors.push(color.r)
      bufferGeometry.colors.push(color.g)
      bufferGeometry.colors.push(color.b)
      bufferGeometry.colors.push(color.r)
      bufferGeometry.colors.push(color.g)
      bufferGeometry.colors.push(color.b)
      bufferGeometry.colors.push(color.r)
      bufferGeometry.colors.push(color.g)
      bufferGeometry.colors.push(color.b)
    })
  }

  addColorVertices = () => {
    const nRows = data.length
    const nCols = data[0].length

    // Adjust our center to display the target white pixel as the center
    const offsetRow = nRows * PIXEL_SIZE / 2 - 0.5 * PIXEL_SIZE
    const offSetCol = nCols * PIXEL_SIZE / 2 + 7 * PIXEL_SIZE

    for (let rowIndex = 0; rowIndex < nRows; rowIndex++) {
      const row = data[rowIndex]
      for (let colIndex = 0; colIndex < nCols; colIndex++) {
        const digit = row[colIndex]
        const colorIndex = parseInt(digit, 16)

        const vertex = {
          x: rowIndex * PIXEL_SIZE - offsetRow,
          y: colIndex * PIXEL_SIZE - offSetCol,
          z: 0,
        }

        this.addColorVertex(colorIndex, rowIndex, colIndex, vertex)
      }
    }
  }

  createBufferGeometries = () => {
    _.map(this.bufferGeometries, (bufferGeometryGroup, colorIndex) => {
      _.map(bufferGeometryGroup, bufferGeometry => {
        const { geometry, positions, colors, normals } = bufferGeometry

        const bufferPositions = new THREE.Float32BufferAttribute(positions, 3)
        const bufferColors = new THREE.Float32BufferAttribute(colors, 3)
        const bufferNormals = new THREE.Float32BufferAttribute(normals, 3)

        geometry.addAttribute('position', bufferPositions)
        geometry.addAttribute('color', bufferColors)
        geometry.addAttribute('normal', bufferNormals)

        const material = new THREE.MeshBasicMaterial({
          vertexColors: THREE.VertexColors,
        })

        geometry.computeBoundingSphere()

        const pixelGroup = new THREE.Mesh(geometry, material)
        this.pixelGroups.push(pixelGroup)
      })
    })
  }

  addPixelsToScene = scene => {
    for (let i = 0; i < this.pixelGroups.length; i++) {
      scene.add(this.pixelGroups[i])
    }
  }

  getPixelFromCoordinates = (x, y) => {
    return {
      row: centerRow + x / PIXEL_SIZE,
      col: centerCol + y / PIXEL_SIZE,
    }
  }

  getPixelFromRealCoordinates = (x, y) => {}
}

function getColorByIndex(colorIndex) {
  return threeColorsByIndex[colorIndex]
}

function getHexColorByIndex(colorIndex) {
  const colorString = colorMap[colorIndex]
  const color = parseInt(colorString.replace(/^#/, ''), 16)
  return color
}
