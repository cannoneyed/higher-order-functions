import React, { Component, PropTypes as t } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

import * as scene from 'three/scene'
import sceneManager from 'core/scene'

import Title from 'components/Title'
import SoundPlayer from 'components/SoundPlayer'

import {
  ActivateButton,
  Stage,
  StageWrapper,
  SkipIntro,
} from './styled-components'

@observer
export default class Composition extends Component {
  static propTypes = {
    activateButtonPresent: t.bool,
    isActive: t.bool,
  }

  state = {
    isHover: false,
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.stage)
    scene.init(container)
  }

  activate = ({ skip } = {}) => {
    const { isIntroAnimationActive } = sceneManager
    if (isIntroAnimationActive) {
      return
    }

    sceneManager.isIntroAnimationActive = true
    sceneManager.activateIntroAnimation(skip)
  }

  setHover = isHover => {
    this.setState({ isHover })
  }

  render() {
    const {
      hasViewedIntro,
      isIntroAnimationActive,
      isIntroAnimationFinished,
      isInteractive,
      tileSize,
    } = sceneManager

    let showActivateButton = !isInteractive
    if (isIntroAnimationFinished) {
      showActivateButton = false
    }

    const showSkipButton =
      hasViewedIntro && !isIntroAnimationFinished && !isIntroAnimationActive

    return (
      <StageWrapper>
        <Stage ref={ref => (this.stage = ref)} onClick={scene.click} />
        {showActivateButton &&
          <ActivateButton
            onClick={this.activate}
            size={tileSize}
            isActive={isIntroAnimationActive}
            isHover={this.state.isHover}
            onMouseEnter={() => this.setHover(true)}
            onMouseLeave={() => this.setHover(false)}
          />}
        {showSkipButton &&
          <SkipIntro
            onClick={() => this.activate({ skip: true })}
            isHover={this.state.isHover}
            onMouseEnter={() => this.setHover(true)}
            onMouseLeave={() => this.setHover(false)}
          >
            skip intro
          </SkipIntro>}
        <SoundPlayer />
        <Title />
      </StageWrapper>
    )
  }
}
