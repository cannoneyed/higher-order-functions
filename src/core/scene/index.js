import { observable } from 'mobx'

class SceneManager {
  @observable isZoomedIn = false
  @observable isInteractive = false
  @observable isAnimationActive = false
  @observable isAnimationFinished = false

  @observable selectedPixel = null

  selectPixel = ({ row, col }) => {
    this.selectedPixel = { row, col }
  }
}

export default new SceneManager()
