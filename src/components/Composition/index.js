import React, { Component, PropTypes as t } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

import * as scene from 'three/scene'
import sceneManager from 'core/scene'

import SoundPlayer from 'components/SoundPlayer'

import { ActivateButton, Stage, StageWrapper } from './styled-components'

@observer
export default class Composition extends Component {
  static propTypes = {
    activateButtonPresent: t.bool,
    isActive: t.bool,
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.stage)
    scene.init(container)
  }

  activate = () => {
    const { isAnimationActive } = sceneManager
    if (isAnimationActive) {
      return
    }

    sceneManager.isAnimationActive = true

    scene.activate()
  }

  render() {
    const { isAnimationActive, isAnimationFinished, tileSize } = sceneManager

    return (
      <StageWrapper>
        <Stage ref={ref => (this.stage = ref)} onClick={scene.click} />
        {!isAnimationFinished &&
          <ActivateButton
            onClick={this.activate}
            size={tileSize}
            isActive={isAnimationActive}
          />}
        <SoundPlayer />
      </StageWrapper>
    )
  }
}
