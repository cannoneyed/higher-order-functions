import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { withRoute } from 'react-router5'
import { getPixelFromHash } from 'utils/hash'

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

@withRoute
@observer
export default class Composition extends Component {
  state = {
    isPixelHovered: false,
    isSkipHovered: false,
  }

  componentDidMount() {
    const { route } = this.props
    const initialHash = route.name === 'hash' ? route.params.hash : null
    const container = ReactDOM.findDOMNode(this.stage)
    scene.init(container, initialHash)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.route.path !== nextProps.route.path) {
      const hashStr = nextProps.route.params.hash
      if (hashStr) {
        const pixel = getPixelFromHash(hashStr)
        scene.zoomToPixel(pixel)
      } else {
        scene.zoomOut()
      }
    }
  }

  activate = ({ skip } = {}) => {
    const { isIntroAnimationActive } = sceneManager
    if (isIntroAnimationActive) {
      return
    }

    sceneManager.activateIntroAnimation(skip)
  }

  handleStageClick = event => {
    const { router } = this.props
    scene.click(event, router)
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
        <Stage
          ref={ref => (this.stage = ref)}
          onClick={this.handleStageClick}
        />
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
