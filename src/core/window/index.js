import { observable } from 'mobx'
import store from 'store'
import { throttle } from 'lodash'

import * as scene from 'three/scene'
import soundManager from 'core/sound'
import data from '../../data/data.json'

class WindowManager {
  @observable width = window.innerWidth
  @observable height = window.innerHeight

  constructor() {
    window.addEventListener('resize', this.resize)
  }

  resize = throttle(() => {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }, 5)
}

export default new WindowManager()
