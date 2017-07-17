const _ = require('lodash')
const data = require('../../src/data/data.json')

let seed = 1
function pseudorandom() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// We want deterministic "hashes" of length 4 for each pixel. We do this by shuffling 15 arrays (one
// for each colorIndex in use) of arrays containing values n from 16^3 (4096)... this will allow us
// to select a predetermined 3-Hex digit for each pixel in each color space, prefixed by the
// colorIndex hex value
const perColorIndexes = _.range(0, 13).map(() => _.range(0, Math.pow(16, 3)))
for (let i = 0; i < perColorIndexes.length; i++) {
  shuffleArray(perColorIndexes[i])
}

// Durstenfeld shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(pseudorandom() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

const hashes = []
const pixelsByColorIndex = {}
_.map(data, (row, rowIndex) => {
  _.map(row, (color, colIndex) => {
    const colorIndex = parseInt(color, 16)
    if (colorIndex === 13) {
      return
    }
    pixelsByColorIndex[colorIndex] = pixelsByColorIndex[colorIndex] || 0
    pixelsByColorIndex[colorIndex] += 1

    const pixelNumber = pixelsByColorIndex[colorIndex]
    const indexNumber = perColorIndexes[colorIndex][pixelNumber]

    const hashStr = `${colorIndex.toString(16)}${indexNumber.toString(16)}`
    hashes.push(hashStr)
  })
})

function hash({ row, col, colorIndex }) {
  const pixelIndex = (row + 1) * (col + 1)
  return hashes[pixelIndex]
}

module.exports = hash

console.log(hash({ row: 0, col: 4 }))
console.log(hash({ row: 0, col: 5 }))
console.log(hash({ row: 0, col: 6 }))
