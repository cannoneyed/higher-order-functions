const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')

const songs = require('./songs')

module.exports.getSongData = _.memoize(songIndex => {
  const song = songs[songIndex]

  const songKey = `${song.index}-${song.title.replace(/ /g, '-')}`
  const CLIPS_DIR =
    '/Users/andrewcoenen/Desktop/deconstructed-higher-order-functions'
  const songDir = `${CLIPS_DIR}/${songKey}`

  // Load the csv track index
  const csv = fs.readFileSync(
    path.resolve(__dirname, `./track-indexes/${songKey}.csv`),
  )
  const rows = parse(csv, { columns: true })

  // Parse the bars of the song, which are the numbered keys of any given row
  const bars = {}
  _.map(rows[0], (value, key) => {
    if (parseInt(key) > 0) {
      bars[key] = []
    }
  })

  // Parse each row, constructing a map of all clips arranged per bar
  let missingFiles = []
  _.map(rows, row => {
    const trackType = _.trim(row['Track Type'])
    const trackName = _.trim(row['Track Name'])

    const track = `${trackType} - ${trackName}`

    // Iterate over each bar, mapping files to bars
    _.map(bars, (items, bar) => {
      let clipIndex = _.trim(row[bar])
      if (!clipIndex) {
        return
      }

      let shifted = 0
      // Handle shifted positions
      if (clipIndex.indexOf('+') !== -1) {
        shifted = _.last(clipIndex.split('+'))
        clipIndex = _.first(clipIndex.split('+'))
      }

      let name
      if (clipIndex === 'X') {
        name = `${track}`
      } else {
        name = `${track} - ${clipIndex}`
      }

      const filename = `${songDir}/${name}.aif`
      if (!fs.existsSync(filename)) {
        missingFiles.push(name)
      }

      bars[bar].push({
        name,
        filename,
        shifted,
      })
    })
  })

  if (missingFiles.length) {
    console.log('Missing files: ', _.uniq(missingFiles))
    throw new Error()
  }

  return {
    bars,
    song,
    songKey,
    songIndex,
  }
})
