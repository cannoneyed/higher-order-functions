import WaveSurfer from 'wavesurfer.js'
import colors from 'constants/colors'
import hash from '../../utils/hash'

const urlRoot = 'http://127.0.0.1:8080'

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

    const light = colorIndex === 0 || colorIndex === 12

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: light ? colors[13] : colors[0],
      progressColor,
      barWidth: 2,
      height: sceneManager.tileSize / 3,
      cursorWidth: 0,
      interact: false,
    })
  }

  loadSound = ({ row, col, colorIndex }) => {
    this.unloadSound()

    this.initializePlayer({ row, col, colorIndex })
    const hashStr = hash({ row, col })
    const mp3Url = `${urlRoot}/${hashStr}.mp3`
    this.wavesurfer.load(mp3Url)

    this.wavesurfer.on('ready', () => {
      this.isLoaded = true
    })
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

    this.wavesurfer.playPause()
  }
}

export default new SoundManager()
