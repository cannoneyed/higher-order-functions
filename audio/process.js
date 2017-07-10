const ffmpeg = require('fluent-ffmpeg')
const P = require('bluebird')
const ProgressBar = require('progress')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')
const Combinatorics = require('js-combinatorics')

const trackKey = '01-higher-order'
const CLIPS_DIR =
  '/Users/andrewcoenen/Desktop/deconstructed-higher-order-functions'
const trackDir = `${CLIPS_DIR}/${trackKey}`

// Load the csv track index
const csv = fs.readFileSync(
  path.resolve(__dirname, `./track-indexes/${trackKey}.csv`),
)

const bars = _.reduce(
  _.range(50),
  (output, index) => {
    output[index * 4 + 1] = []
    return output
  },
  {},
)

const rows = parse(csv, { columns: true })
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

    let shift = 0
    // Handle shifted positions
    if (clipIndex.indexOf('+') !== -1) {
      shift = _.last(clipIndex.split('+'))
      clipIndex = _.first(clipIndex.split('+'))
    }

    let name
    if (clipIndex === 'X') {
      name = `${track}`
    } else {
      name = `${track} - ${clipIndex}`
    }

    const filename = `${trackDir}/${name}.aif`
    if (!fs.existsSync(filename)) {
      missingFiles.push(name)
    }

    bars[bar].push({
      name,
      filename,
      shift,
    })
  })
})

if (missingFiles.length) {
  console.log('Missing files: ', _.unique(missingFiles))
  throw new Error()
}

const alphabetic = (a, b) => {
  if (a.firstname < b.firstname) return -1
  if (a.firstname > b.firstname) return 1
  return 0
}

const mixSlugs = {}
_.map(bars, (clips, bar) => {
  _.map(clips, clip => {
    const { name, shift } = clip
    if (shift) {
      return
    }
    mixSlugs[name] = [clip]
  })

  if (clips.length < 2) {
    return
  }

  const comb = Combinatorics.combination(clips, 2)
  let a
  while ((a = comb.next())) {
    const sorted = a.sort(alphabetic)
    const slug = sorted.map(item => item.name).join('|')
    mixSlugs[slug] = sorted
  }
})

const nSlugs = Object.keys(mixSlugs).length
console.log(`🍒 generating ${nSlugs} clips`)
const bar = new ProgressBar(':bar', { total: nSlugs })

P.map(
  Object.keys(mixSlugs),
  (slug, index) => {
    const files = mixSlugs[slug]
    const outputName = path.resolve(
      __dirname,
      'output',
      trackKey,
      `${index}.mp3`,
    )
    return P.delay(2)
      .then(() => outputAudio(files, outputName))
      .then(() => bar.tick())
  },
  { concurrency: 1 },
).then(() => {
  console.log('🍒 done!')
})

function outputAudio(files, outputName) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg().outputOptions(['-y'])

    for (let file of files) {
      const { filename } = file
      cmd.input(filename)
    }

    const mixInputs = files.map((file, i) => `[${i}:0]`).join('')
    const mixString = `${mixInputs}amix=inputs=${files.length}:duration=longest[out]`
    const volString = `[out]volume=${files.length}`

    cmd
      .complexFilter([mixString, volString])
      .audioChannels(2)
      .audioCodec('libmp3lame')
      .audioQuality(0)
      .output(outputName)
      .on('end', () => {
        resolve()
      })
      .run()
  })
}
