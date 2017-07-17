const ffmpeg = require('fluent-ffmpeg')
const P = require('bluebird')
const ProgressBar = require('progress')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')

const { song, songKey } = require('./song-data')
const { mixes } = require('./clip-mixes')

const beats = song.beats || 4

P.coroutine(function*() {
  yield shiftClips()
  // yield processTracks()
})()

function shiftClips() {
  const shiftedClips = {}
  _.map(mixes, mixObj => {
    const clips = mixObj.clips
    _.map(clips, clip => {
      if (clip.shifted) {
        shiftedClips[`${clip.name}-${clip.shifted}`] = clip
      }
    })
  })

  const shiftedClipNames = Object.keys(shiftedClips)
  console.log(`🍒 shifting ${shiftedClipNames.length} clips`)
  const bar = new ProgressBar('[:bar] :current/:total', {
    total: shiftedClipNames.length,
  })

  return P.map(
    shiftedClipNames,
    clipName => {
      const clip = shiftedClips[clipName]
      return shiftClip(clip).then(() => bar.tick())
    },
    { concurrency: 1 },
  )
}

function shiftClip(clip) {
  return new Promise((resolve, reject) => {
    const { filename, shifted } = clip

    const bpm = typeof song.bpm === 'function' ? song.bpm(clip.bar) : song.bpm
    const shift = shifted * beats * 60 / bpm
    const shiftedFilename = `${filename.replace(
      '.aif',
      '',
    )} - shifted-${shifted}.wav`
    clip.shiftedFilename = shiftedFilename

    return createSilence(shift).then(() => {
      ffmpeg()
        .input(path.resolve(__dirname, './silence.wav'))
        .input(filename)
        .complexFilter(['[0:0][1:0]concat=n=2:v=0:a=1'])
        .audioChannels(2)
        .output(shiftedFilename)
        .on('end', () => {
          resolve()
        })
        .run()
    })
  })
}

function createSilence(t) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .outputOptions(['-y'])
      .input('anullsrc=r=44100:cl=2')
      .inputFormat('lavfi')
      .duration(t)
      .output(path.resolve(__dirname, './silence.wav'))
      .on('end', () => {
        resolve()
      })
      .run()
  })
}

function processTracks() {
  const nSlugs = Object.keys(mixes).length
  console.log(`🍒 generating ${nSlugs} clips`)
  const bar = new ProgressBar('[:bar] :current/:total', { total: nSlugs })

  return P.map(
    Object.keys(mixes),
    (slug, index) => {
      const files = mixes[slug]
      const outputName = path.resolve(
        __dirname,
        'output',
        songKey,
        `${index}.mp3`,
      )
      return outputAudio(files, outputName).then(() => bar.tick())
    },
    { concurrency: 1 },
  ).then(() => {
    console.log('🍒 done!')
  })
}

function outputAudio(files, outputName) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg().outputOptions(['-y'])

    for (let file of files) {
      const { filename, shift, shiftedFilename } = file

      if (shift && files.length > 1) {
        cmd.input(shiftedFilename)
      } else {
        cmd.input(filename)
      }
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
