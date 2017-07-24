import { observable } from 'mobx'
import store from 'store'

import * as scene from 'three/scene'
import soundManager from 'core/sound'
import data from '../../data/data.json'

class SceneManager {
  @observable hasViewedIntro = false

  @observable isZoomedIn = false
  @observable isInteractive = false
  @observable isIntroAnimationActive = false
  @observable isIntroAnimationFinished = false

  INTRO_ANIMATION_TIME = 30000
  INTRO_ANIMATION_OFFSET = 800

  @observable selectedPixel = null
  @observable tileSize = 128

  constructor() {
    this.hasViewedIntro = !!store.get('hasViewedIntro')
  }

  activateIntroAnimation = (skip = false) => {
    if (skip) {
      this.INTRO_ANIMATION_TIME = 4000
      this.INTRO_ANIMATION_OFFSET = 1600
    }

    this.isIntroAnimationActive = true
    scene.activateIntroAnimation()
  }

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

  finishIntroAnimation = () => {
    this.isIntroAnimationActive = false
    this.isIntroAnimationFinished = true
    this.setHasViewedIntro()
  }

  setHasViewedIntro = () => {
    store.set('hasViewedIntro', true)
    this.hasViewedIntro = true
  }
}

export default new SceneManager()
