import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { withRoute } from 'react-router5'
import { getPixelFromHash } from 'utils/hash'

import * as scene from 'three/scene'
import sceneManager from 'core/scene'
import soundManager from 'core/sound'

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
    isActivateHovered: false,
    isSkipHovered: false,
    initialHash: null,
  }

  componentDidMount() {
    const { route } = this.props
    const initialHash = route.name === 'hash' ? route.params.hash : null
    const container = ReactDOM.findDOMNode(this.stage)
    scene.init(container, initialHash)

    this.setState({ initialHash }) // eslint-disable-line react/no-did-mount-set-state
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
    const { isIntroLoaded } = soundManager

    if (isIntroAnimationActive) {
      return
    }

    if (!isIntroLoaded && !skip) {
      return
    }

    if (!skip) {
      soundManager.playIntro()
    }

    sceneManager.activateIntroAnimation(skip)
  }

  handleHover = (enterExit, elName) => () => {
    const { isIntroLoaded } = soundManager
    if (!isIntroLoaded && elName === 'activate') {
      return
    }

    const key = elName === 'activate' ? 'isActivateHovered' : 'isSkipHovered'
    const val = enterExit === 'enter' ? true : false

    this.setState({ [key]: val })
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
      hasViewedIntro &&
      !isIntroAnimationFinished &&
      !isIntroAnimationActive &&
      !this.state.initialHash

    const isActivateHovered =
      this.state.isActivateHovered || this.state.isSkipHovered

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
            isHover={isActivateHovered}
            onMouseEnter={this.handleHover('enter', 'activate')}
            onMouseLeave={this.handleHover('exit', 'activate')}
          />}
        {showSkipButton &&
          <SkipIntro
            onClick={() => this.activate({ skip: true })}
            isHover={this.state.isSkipHovered}
            onMouseEnter={this.handleHover('enter', 'skip')}
            onMouseLeave={this.handleHover('exit', 'skip')}
          >
            skip intro
          </SkipIntro>}
        <SoundPlayer />
        <Title />
      </StageWrapper>
    )
  }
}
