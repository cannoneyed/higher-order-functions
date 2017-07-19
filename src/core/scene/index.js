import { observable } from 'mobx'

import soundManager from 'core/sound'
import data from '../../data/data.json'

class SceneManager {
  @observable isZoomedIn = false
  @observable isInteractive = false
  @observable isAnimationActive = false
  @observable isAnimationFinished = false

  @observable selectedPixel = null

  @observable tileSize = 128

  selectPixel = ({ row, col }) => {
    const color = data[row][col]
    const colorIndex = parseInt(color, 16)

    this.selectedPixel = { row, col, colorIndex }

    // We need to delay the loading of the sound to prevent redraw of
    // the waveform until faded out
    setTimeout(() => {
      soundManager.loadSound({ row, col, colorIndex })
    }, soundManager.loadDelay)
  }

  deselectPixel = () => {
    this.selectedPixel = null

    // We need to delay the loading of the sound to prevent redraw of
    // the waveform until faded out
    setTimeout(() => {
      soundManager.unloadSound()
    }, soundManager.loadDelay)
  }
}

export default new SceneManager()
