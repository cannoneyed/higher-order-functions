import { observable } from 'mobx'
import WaveSurfer from 'wavesurfer.js'
import colors from 'constants/colors'
import hash from '../../utils/hash'

const urlRoot =
  'https://s3-us-west-2.amazonaws.com/higher-order-functions.clips'

import sceneManager from 'core/scene'

class SoundManager {
  loadDelay = 200
  @observable isLoaded = false
  @observable waveColor = colors[13]

  @observable isIntroLoaded = false

  loadIntroAudio() {
    this.introPlayer = WaveSurfer.create({
      container: '#introPlayer',
      interact: false,
    })

    const mp3Url = `${urlRoot}/web_intro.mp3`
    this.introPlayer.load(mp3Url)
    this.introPlayer.on('ready', () => {
      this.isIntroLoaded = true
    })
  }

  playIntro() {
    if (!this.isIntroLoaded) {
      return
    }
    this.introPlayer.play()
  }

  initializePlayer({ row, col, colorIndex }) {
    const compliments = colors.filter((color, index) => {
      return index !== colorIndex && index !== 0
    })

    const complimentIndex = row * col % 12
    const progressColor = compliments[complimentIndex]

    const light = colorIndex === 0 || colorIndex === 12
    this.waveColor = light ? colors[13] : colors[0]

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: this.waveColor,
      progressColor,
      barWidth: 2,
      normalize: true,
      height: sceneManager.tileSize / 3,
      cursorWidth: 0,
      interact: false,
    })
  }

  loadSound = ({ row, col, colorIndex }) => {
    this.unloadSound()

    this.initializePlayer({ row, col, colorIndex })
    const hashStr = hash({ row, col })

    const mp3Url = this.getMp3Url(hashStr)

    this.wavesurfer.load(mp3Url)
    this.wavesurfer.on('ready', () => {
      this.isLoaded = true
    })
  }

  getMp3Url = hashStr => {
    const hashDir = hashStr.substring(0, 1)
    const mp3Url = `${urlRoot}/${hashDir}/${hashStr}.mp3`
    return mp3Url
  }

  unloadSound = () => {
    this.isLoaded = false
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
    }
  }

  playSound = () => {
    if (!this.isLoaded) {
      return
    }

    this.wavesurfer.play()
  }

  toggleSound = () => {
    if (!this.isLoaded) {
      return
    }

    this.wavesurfer.playPause()
  }
}

export default new SoundManager()
