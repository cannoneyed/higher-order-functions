import WaveSurfer from 'wavesurfer.js'
import { colors } from 'three/constants'

const mp3Url =
  'https://s3-us-west-2.amazonaws.com/clips.higher-order-functions/08.mp3'

import sceneManager from 'core/scene'

class SoundManager {
  loadDelay = 200
  isLoaded = false

  initializePlayer({ row, col, colorIndex }) {
    const compliments = colors.filter((color, index) => {
      return index !== colorIndex && index !== 0
    })

    const complimentIndex = row * col % 12
    const progressColor = compliments[complimentIndex]

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#c7d9e7',
      progressColor,
      barWidth: 2,
      height: sceneManager.tileSize / 3,
      cursorWidth: 0,
      interact: false,
    })
  }

  loadSound = ({ row, col, colorIndex }) => {
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
    }

    this.initializePlayer({ row, col, colorIndex })

    this.wavesurfer.load(mp3Url)
    this.isLoaded = false

    this.wavesurfer.on('ready', () => {
      this.isLoaded = true
    })
  }

  unloadSound = () => {
    this.isLoaded = false
    this.wavesurfer.destroy()
  }

  playSound = () => {
    if (!this.isLoaded) {
      return
    }

    this.wavesurfer.playPause()
  }
}

export default new SoundManager()
