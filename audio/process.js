const ffmpeg = require('fluent-ffmpeg')
const P = require('bluebird')
const ProgressBar = require('progress')
const _ = require('lodash')
const path = require('path')

const { getSongData } = require('./song-data')
const { getMixes } = require('./clip-mixes')

const songIndex = process.argv[2]

if (!songIndex) {
  throw new Error('Did not specify a song index')
}

const { bars, song, songKey } = getSongData(songIndex)
const mixes = getMixes(bars)
const beats = song.beats || 4

const processSong = P.coroutine(function*() {
  console.log(`🍒 processing track ${songIndex + 1}: ${song.title}`)

  yield shiftClips()
  yield processTracks()
})
processSong()

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
  console.log(`🍒 generating ${mixes.length} clips`)
  const bar = new ProgressBar('[:bar] :current/:total', {
    total: mixes.length,
  })

  return P.map(
    mixes,
    submix => {
      const { clips, hash } = submix
      const outputName = path.resolve(
        __dirname,
        'output',
        songKey,
        `${hash}.mp3`,
      )
      return outputAudio(clips, outputName).then(() => bar.tick())
    },
    { concurrency: 1 },
  ).then(() => {
    console.log('🍒 done!')
  })
}

function outputAudio(clips, outputName) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg().outputOptions(['-y'])

    for (let clip of clips) {
      const { filename, shift, shiftedFilename } = clip

      if (shift && clips.length > 1) {
        cmd.input(shiftedFilename)
      } else {
        cmd.input(filename)
      }
    }

    const mixInputs = clips.map((clip, i) => `[${i}:0]`).join('')
    const mixString = `${mixInputs}amix=inputs=${clips.length}:duration=longest[a]`
    const volString = `[a]volume=${clips.length}[b]`
    const normString = '[b]dynaudnorm'

    cmd
      .complexFilter([mixString, volString, normString])
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
