const _ = require('lodash')
const data = require('../data/data.json')
const shuffleArray = require('./shuffle')

// We want deterministic "hashes" of length 4 for each pixel. We do this by shuffling 15 arrays (one
// for each colorIndex in use) of arrays containing values n from 16^3 (4096)... this will allow us
// to select a predetermined 3-Hex digit for each pixel in each color space, prefixed by the
// colorIndex hex value
const perColorIndexes = _.range(0, 13).map(() => _.range(1, Math.pow(16, 3)))
for (let i = 0; i < perColorIndexes.length; i++) {
  shuffleArray(perColorIndexes[i])
}

// Iterate over every pixel, selecting the pre-shuffled value from 1 to 4096 to keep as the "hash" of that pixel
const hashes = _.range(0, data.length).map(() => [])
const pixelNumberByColor = {}
_.map(data, (row, rowIndex) => {
  _.map(row, (color, colIndex) => {
    const colorIndex = parseInt(color, 16)
    if (colorIndex === 13) {
      return
    }
    pixelNumberByColor[colorIndex] = pixelNumberByColor[colorIndex] || 0
    pixelNumberByColor[colorIndex] += 1

    const pixelNumber = pixelNumberByColor[colorIndex]
    const hashNumber = perColorIndexes[colorIndex][pixelNumber]

    const hexString = _.padStart(hashNumber.toString(16), 3, '0')

    const hashStr = `${colorIndex.toString(16)}${hexString}`
    hashes[rowIndex][colIndex] = hashStr
  })
})

// Select the corresponding "hash" for each pixel
function hash(pixel) {
  if (!pixel) {
    return '    '
  }
  const { row, col } = pixel
  return hashes[row][col]
}

module.exports = hash
