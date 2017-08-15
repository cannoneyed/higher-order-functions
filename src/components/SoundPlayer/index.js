import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Spinner from 'react-spinkit'
import Hash from 'components/Hash'

import {
  IntroSoundPlayer,
  SpinnerWrapper,
  Waveform,
  SoundPlayerWrapper,
} from './styled-components'

import sceneManager from 'core/scene'
import soundManager from 'core/sound'

@observer
export default class SoundPlayer extends Component {
  componentDidMount() {
    soundManager.loadIntroAudio()
  }

  render() {
    const { isZoomedIn, isInteractive, tileSize } = sceneManager
    const { isLoaded, isIntroLoaded, waveColor } = soundManager
    const visible = isZoomedIn || !isIntroLoaded

    const zoomedTileLoaderVisible = isInteractive && !isLoaded
    const showLoader = zoomedTileLoaderVisible || !isIntroLoaded

    return (
      <SoundPlayerWrapper visible={visible} size={tileSize}>
        <Hash />
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
        <IntroSoundPlayer id="introPlayer" />
      </SoundPlayerWrapper>
    )
  }
}
