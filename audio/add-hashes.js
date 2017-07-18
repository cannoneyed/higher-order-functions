const _ = require('lodash')
const data = require('../src/data/data.json')
const hash = require('../src/utils/hash')
const shuffleArray = require('../src/utils/shuffle')
const { getSongData } = require('./song-data')

module.exports = function addHashes(submixes) {
  const songIndex = parseInt(process.argv[2])
  const { song } = getSongData(songIndex)

  // Since we're grouping song no 7 (index 6) (inner planets) and 9 (level 9) together as index 6 and ignoring index 13 (black),
  // we'll need to correct for the track offsets
  let correspondingColorIndex
  if (songIndex === 8) {
    correspondingColorIndex = 6
  } else if (songIndex >= 9) {
    correspondingColorIndex = songIndex - 1
  } else {
    correspondingColorIndex = songIndex
  }

  const hashes = []
  _.map(data, (row, rowIndex) => {
    _.map(row, (color, colIndex) => {
      const colorIndex = parseInt(color, 16)

      if (colorIndex === correspondingColorIndex) {
        let hashStr = hash({ row: rowIndex, col: colIndex })
        // Substitute the first character of the hash string with the corresponding color
        // (adjusting for the grouping of tracks 7 and 9)
        const newHex = correspondingColorIndex.toString(16)
        hashStr = `${newHex}${hashStr.substring(1, 4)}`

        hashes.push(hashStr)
      }
    })
  })

  // Now, deterministically shuffle the hashes
  shuffleArray(hashes)

  // Since inner planets and level 9 share the same color, we need to offset
  // by the number of submixes for inner planets when processing level 9
  const offset = song.offset || 0
  return _.map(submixes, (entry, index) => {
    const hashStr = hashes[index + offset]
    entry.hash = hashStr
    return _.clone(entry) // We don't want to apply the same hash to the "same" clip
  }).filter(entry => entry.hash)
}
