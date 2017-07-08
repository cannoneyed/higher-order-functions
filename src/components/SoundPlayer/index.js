import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import Hash from 'components/Hash'

import sceneManager from 'core/scene'
import soundManager from 'core/sound'

@observer
export default class SoundPlayer extends Component {
  render() {
    const { isZoomedIn, isInteractive, tileSize } = sceneManager
    const visible = isZoomedIn
    return (
      <SoundPlayerWrapper visible={visible} size={tileSize}>
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
