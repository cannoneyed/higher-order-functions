import * as THREE from 'three'
import _ from 'lodash'
import colorMap from 'constants/colors'
import data from 'data/data.json'

const threeColorsByIndex = _.map(colorMap, (colorString, colorIndex) => {
  return new THREE.Color(getHexColorByIndex(colorIndex))
})

const N_GROUPS = 3
const MAGIC_NUMBER = 551

const centerRow = 132
const centerCol = 76

const fragmentShader = `
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4( vColor, 1.0 );
    }
`

const vertexShader = `
    attribute float vertexIndex;
    attribute vec3 center;
    uniform float size;
    uniform vec3 color;
    varying vec3 vColor;
    void main() {
        vec3 newPos = position;

        if (vertexIndex == 0.0) {
          newPos.x = -0.5 * size + center.x;
          newPos.y = 0.5 * size + center.y;
        }
        if (vertexIndex == 1.0) {
          newPos.x = 0.5 * size + center.x;
          newPos.y = 0.5 * size + center.y;
        }
        if (vertexIndex == 2.0) {
          newPos.x = -0.5 * size + center.x;
          newPos.y = -0.5 * size + center.y;
        }
        if (vertexIndex == 3.0) {
          newPos.x = 0.5 * size + center.x;
          newPos.y = -0.5 * size + center.y;
        }

        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( newPos, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`

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
        centers: [],
        indices: [],
      }))
    })

    this.pixelGroups = []
    this.renderer = renderer
    this.pixelSize = 2 * this.renderer.getSize().height / data.length

    this.addColorVertices()
    this.createBufferGeometries()
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

    const geometry = new THREE.PlaneGeometry(this.pixelSize, this.pixelSize)
    geometry.translate(vertex.x, vertex.y, vertex.z)

    // If we're the centered on white pixel, force it into group [0, 0]
    if (rowIndex === centerRow && colIndex === centerCol) {
      console.log('🔥', geometry, vertex)
    }

    // If we're the centered on white pixel, force it into group [0, 0]
    if (rowIndex === centerRow && colIndex === centerCol + 1) {
      console.log('🔥', geometry, vertex)
    }

    geometry.faces.forEach(function(face, index) {
      const vertexA = geometry.vertices[face.a]
      const vertexB = geometry.vertices[face.b]
      const vertexC = geometry.vertices[face.c]
      bufferGeometry.positions.push(vertexA.x, vertexA.y, vertexA.z)
      bufferGeometry.positions.push(vertexB.x, vertexB.y, vertexB.z)
      bufferGeometry.positions.push(vertexC.x, vertexC.y, vertexC.z)

      // Add the center position to the buffers corresponding to each vertex of the triangle
      bufferGeometry.centers.push(vertex.x, vertex.y, vertex.z)
      bufferGeometry.centers.push(vertex.x, vertex.y, vertex.z)
      bufferGeometry.centers.push(vertex.x, vertex.y, vertex.z)

      // And add the vertex index to track which vertex we're processing in the shader
      bufferGeometry.indices.push(face.a)
      bufferGeometry.indices.push(face.b)
      bufferGeometry.indices.push(face.c)
    })
  }

  addColorVertices = () => {
    const nRows = data.length
    const nCols = data[0].length

    // Adjust our center to display the target white pixel as the center
    const offsetRow = nRows * this.pixelSize / 2 - 0.5 * this.pixelSize
    const offSetCol = nCols * this.pixelSize / 2 + 7 * this.pixelSize

    for (let rowIndex = 0; rowIndex < nRows; rowIndex++) {
      const row = data[rowIndex]
      for (let colIndex = 0; colIndex < nCols; colIndex++) {
        const digit = row[colIndex]
        const colorIndex = parseInt(digit, 16)

        const vertex = {
          x: rowIndex * this.pixelSize - offsetRow,
          y: colIndex * this.pixelSize - offSetCol,
          z: 0,
        }

        this.addColorVertex(colorIndex, rowIndex, colIndex, vertex)
      }
    }
  }

  createBufferGeometries = () => {
    _.map(this.bufferGeometries, (bufferGeometryGroup, colorIndex) => {
      _.map(bufferGeometryGroup, bufferGeometry => {
        const { geometry, positions, centers, indices } = bufferGeometry

        const bufferPositions = new THREE.Float32BufferAttribute(positions, 3)
        const bufferCenters = new THREE.Float32BufferAttribute(centers, 3)
        const bufferIndices = new THREE.Uint16BufferAttribute(indices, 1)
        geometry.addAttribute('position', bufferPositions)
        geometry.addAttribute('center', bufferCenters)
        geometry.addAttribute('vertexIndex', bufferIndices)

        const color = getColorByIndex(colorIndex)

        const uniforms = {
          color: { value: color },
          size: { value: this.pixelSize, type: 'f' },
        }

        const material = new THREE.ShaderMaterial({
          uniforms,
          fragmentShader,
          vertexShader,
        })

        geometry.computeBoundingSphere()

        const pixelGroup = new THREE.Mesh(geometry, material)
        this.pixelGroups.push(pixelGroup)
      })
    })
  }

  updatePixelSize(size) {
    for (let i = 0; i < this.pixelGroups.length; i++) {
      const pixelGroup = this.pixelGroups[i]
      if (size !== pixelGroup.material.uniforms.size) {
        pixelGroup.material.uniforms.size.value = size
        pixelGroup.material.uniforms.size.needsUpdate = true
      }
    }
  }

  addPixelsToScene = scene => {
    for (let i = 0; i < this.pixelGroups.length; i++) {
      scene.add(this.pixelGroups[i])
    }
  }

  getPixelFromCoordinates = (x, y) => {
    return {
      row: centerRow + x / this.pixelSize,
      col: centerCol + y / this.pixelSize,
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
