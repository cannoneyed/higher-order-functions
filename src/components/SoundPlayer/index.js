import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import Spinner from 'react-spinkit'
import Hash from 'components/Hash'

import sceneManager from 'core/scene'
import soundManager from 'core/sound'

@observer
export default class SoundPlayer extends Component {
  render() {
    const { isZoomedIn, isInteractive, tileSize } = sceneManager
    const { isLoaded, waveColor } = soundManager
    const visible = isZoomedIn
    const showLoader = isInteractive && !isLoaded
    return (
      <SoundPlayerWrapper visible={visible} size={tileSize}>
        {showLoader &&
          <SpinnerWrapper>
            <Spinner name="wandering-cubes" color={waveColor} />
          </SpinnerWrapper>}
        <Waveform
          id="waveform"
          size={tileSize / 3}
          isInteractive={isInteractive}
          onClick={soundManager.playSound}
        />
        <Hash />
      </SoundPlayerWrapper>
    )
  }
}

const SpinnerWrapper = styled.div`
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Waveform = styled.div`
  cursor: pointer;
  width: 80%;
  height: ${props => props.size}px;

  opacity: ${props => (props.isInteractive ? 1 : 0)};
  transition: all ${soundManager.loadDelay}ms linear;
`

const SoundPlayerWrapper = styled.div`
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  backface-visibility: hidden;
  width: ${props => props.size}px;
  height: ${props => props.size + 1}px;
  position: absolute;
  z-index: 999;

  display: flex;
  justify-content: center;
  align-items: center;
`
