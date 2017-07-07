import React, { Component, PropTypes as t } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

import * as scene from 'three/scene'
import sceneManager from 'core/scene'

import { ActivateButton, Stage, StageWrapper } from './styled-components'

const BUTTON_TRANSITION_TIME = 1200

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

    setTimeout(
      () => (sceneManager.showActivateButton = false),
      BUTTON_TRANSITION_TIME,
    )
  }

  render() {
    const { isAnimationActive, showActivateButton } = sceneManager

    return (
      <StageWrapper>
        <Stage ref={ref => (this.stage = ref)} onClick={scene.click} />
        {showActivateButton &&
          <ActivateButton
            onClick={this.activate}
            size={128}
            isActive={isAnimationActive}
            transitionTime={BUTTON_TRANSITION_TIME}
          />}
      </StageWrapper>
    )
  }
}
