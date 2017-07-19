import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { withRoute } from 'react-router5'
import { getPixelFromHash } from 'utils/hash'

import * as scene from 'three/scene'
import sceneManager from 'core/scene'

import Title from 'components/Title'
import SoundPlayer from 'components/SoundPlayer'

import { ActivateButton, Stage, StageWrapper } from './styled-components'

@withRoute
@observer
export default class Composition extends Component {
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

  activate = () => {
    const { isAnimationActive } = sceneManager
    if (isAnimationActive) {
      return
    }

    sceneManager.isAnimationActive = true
    scene.activate()
  }

  handleStageClick = event => {
    const { router } = this.props
    scene.click(event, router)
  }

  render() {
    const {
      isAnimationActive,
      isAnimationFinished,
      isInteractive,
      tileSize,
    } = sceneManager

    let showActivateButton = !isInteractive
    if (isAnimationFinished) {
      showActivateButton = false
    }

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
            isActive={isAnimationActive}
          />}
        <SoundPlayer />
        <Title />
      </StageWrapper>
    )
  }
}
