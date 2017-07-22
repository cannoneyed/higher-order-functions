import * as THREE from 'three'
import _ from 'lodash'
import colorMap from 'constants/colors'
import data from 'data/data.json'

const threeColorsByIndex = _.map(colorMap, (colorString, colorIndex) => {
  return new THREE.Color(getHexColorByIndex(colorIndex))
})

const N_GROUPS = 3
const ADJUST = 2.94
const MAGIC_NUMBER = 551
const PIXEL_SIZE = 10

const centerRow = 132
const centerCol = 76

const fragmentShader = `
    uniform vec3 color;
    uniform sampler2D texture;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4( color * vColor, 1.0 );
        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    }
`

const vertexShader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 300.0 / -mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
    }
`

// Make more groups for white (colorIndex === 0)
const getNGroups = colorIndex =>
  colorIndex * 1 === 0 ? N_GROUPS * 3 : N_GROUPS

class ParticleManager {
  constructor() {
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
        positions: new Float32Array(count * 3),
        colors: new Float32Array(count * 3),
        sizes: new Float32Array(count),
        index: 0,
      }))
    })

    this.particles = []

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
    const pointIndex = bufferGeometry.index

    // If we're the centered on white pixel, force it into group [0, 0]
    if (rowIndex === centerRow && colIndex === centerCol) {
      bufferGeometry = this.getBufferGeometry(0, 0)
    }

    bufferGeometry.positions[pointIndex * 3] = vertex.x
    bufferGeometry.positions[pointIndex * 3 + 1] = vertex.y
    bufferGeometry.positions[pointIndex * 3 + 2] = vertex.z

    const color = getColorByIndex(colorIndex)

    bufferGeometry.colors[pointIndex * 3] = color.r
    bufferGeometry.colors[pointIndex * 3 + 1] = color.g
    bufferGeometry.colors[pointIndex * 3 + 2] = color.b

    bufferGeometry.sizes[pointIndex] = PIXEL_SIZE * ADJUST

    bufferGeometry.index += 1
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
    const uniforms = {
      color: { value: new THREE.Color(0xffffff) },
      texture: {
        value: new THREE.TextureLoader().load('sprite.png'),
      },
    }
    let shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })

    _.map(this.bufferGeometries, (bufferGeometryGroup, colorIndex) => {
      _.map(bufferGeometryGroup, bufferGeometry => {
        const { geometry, positions, colors, sizes } = bufferGeometry
        geometry.addAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3),
        )
        geometry.addAttribute(
          'customColor',
          new THREE.BufferAttribute(colors, 3),
        )
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geometry.computeBoundingSphere()

        const particleSystem = new THREE.Points(geometry, shaderMaterial)
        this.particles.push(particleSystem)
      })
    })
  }

  addParticlesToScene = scene => {
    for (let i = 0; i < this.particles.length; i++) {
      scene.add(this.particles[i])
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

export default new ParticleManager()

function getColorByIndex(colorIndex) {
  return threeColorsByIndex[colorIndex]
}

function getHexColorByIndex(colorIndex) {
  const colorString = colorMap[colorIndex]
  const color = parseInt(colorString.replace(/^#/, ''), 16)
  return color
}
