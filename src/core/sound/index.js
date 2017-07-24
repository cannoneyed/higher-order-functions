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
  @observable waveColor = colors[0]

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
    const hashDir = hashStr.substring(0, 1)
    const mp3Url = `${urlRoot}/${hashDir}/${hashStr}.mp3`
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
