import { observable } from 'mobx'

class SceneManager {
  @observable isZoomedIn = false
  @observable isInteractive = false
  @observable isAnimationActive = false
  @observable showActivateButton = true

  @observable selectedPoint = null

  selectPixel = ({ row, col }) => {
    console.log('🍕', { row, col })
  }
}

export default new SceneManager()
