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
    isPixelHovered: false,
    isSkipHovered: false,
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

    const isPixelHovered = this.state.isPixelHovered || this.state.isSkipHovered

    return (
      <StageWrapper>
        <Stage ref={ref => (this.stage = ref)} onClick={scene.click} />
        {showActivateButton &&
          <ActivateButton
            onClick={this.activate}
            size={tileSize}
            isActive={isIntroAnimationActive}
            isHover={isPixelHovered}
            onMouseEnter={() => this.setState({ isPixelHovered: true })}
            onMouseLeave={() => this.setState({ isPixelHovered: false })}
          />}
        {showSkipButton &&
          <SkipIntro
            onClick={() => this.activate({ skip: true })}
            isHover={this.state.isSkipHovered}
            onMouseEnter={() => this.setState({ isSkipHovered: true })}
            onMouseLeave={() => this.setState({ isSkipHovered: false })}
          >
            skip intro
          </SkipIntro>}
        <SoundPlayer />
        <Title />
      </StageWrapper>
    )
  }
}
