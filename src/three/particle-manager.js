import * as THREE from 'three'
import _ from 'lodash'
import colors from 'constants/colors'
import data from 'data/data.json'

const N_GROUPS = 3
const ADJUST = 1.325
const MAGIC_NUMBER = 551
const PIXEL_SIZE = 10

const centerRow = 132
const centerCol = 76

// Make more groups for white (colorIndex === 0)
const getNGroups = colorIndex => (colorIndex === 0 ? N_GROUPS * 3 : N_GROUPS)

class ParticleManager {
  constructor() {
    this.geometries = _.range(colors.length).map(colorIndex =>
      _.range(getNGroups(colorIndex)).map(() => new THREE.Geometry()),
    )

    this.particles = []

    this.addColorVertices()
    this.assignColorsToGeometries()
  }

  getGeometry(colorIndex, groupIndex) {
    return this.geometries[colorIndex][groupIndex]
  }

  addColorVertex = (colorIndex, rowIndex, colIndex, vertex) => {
    // Pseudo hashing function to assign a vertex to a particle group
    const calc = rowIndex + colIndex + rowIndex * rowIndex * colIndex
    const groupNumber = (calc >> MAGIC_NUMBER) % (getNGroups(colorIndex) - 1) // eslint-disable-line no-bitwise

    let geometry = this.getGeometry(colorIndex, groupNumber)

    // If we're the centered on white pixel, force it into group [0, 0]
    if (rowIndex === centerRow && colIndex === centerCol) {
      geometry = this.getGeometry(0, 0)
    }
    geometry.vertices.push(vertex)
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

        const vertex = new THREE.Vector3()
        vertex.x = rowIndex * PIXEL_SIZE - offsetRow
        vertex.y = colIndex * PIXEL_SIZE - offSetCol
        vertex.z = 0

        this.addColorVertex(colorIndex, rowIndex, colIndex, vertex)
      }
    }
  }

  assignColorsToGeometries = () => {
    const geometries = this.geometries
    for (let colorIndex = 0; colorIndex < geometries.length; colorIndex++) {
      const geometryGroup = geometries[colorIndex]
      for (
        let groupIndex = 0;
        groupIndex < geometryGroup.length;
        groupIndex++
      ) {
        const geometry = geometryGroup[groupIndex]
        const color = getHexColorByIndex(colorIndex)
        const size = PIXEL_SIZE * ADJUST

        const material = new THREE.PointsMaterial({ size })
        material.color.setHex(color)

        const particles = new THREE.Points(geometry, material)
        particles.colorIndex = colorIndex
        particles.groupIndex = groupIndex

        this.particles.push(particles)
      }
    }
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
}

export default new ParticleManager()

function getHexColorByIndex(colorIndex) {
  const colorString = colors[colorIndex]
  const color = parseInt(colorString.replace(/^#/, ''), 16)
  return color
}
