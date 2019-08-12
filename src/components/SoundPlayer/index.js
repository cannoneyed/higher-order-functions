import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Spinner from 'react-spinkit';
import Hash from 'components/Hash';

import {
  IntroSoundPlayer,
  SpinnerWrapper,
  Waveform,
  SoundPlayerWrapper,
} from './styled-components';

import sceneManager from 'core/scene';
import soundManager from 'core/sound';

@observer
export default class SoundPlayer extends Component {
  componentDidMount() {
    soundManager.loadIntroAudio();
  }

  render() {
    const { isZoomedIn, isInteractive, tileSize } = sceneManager;
    const { isLoaded, isIntroLoaded, waveColor } = soundManager;
    const visible = isZoomedIn || !isIntroLoaded;

    const zoomedTileLoaderVisible = isInteractive && !isLoaded;
    const showLoader = zoomedTileLoaderVisible || !isIntroLoaded;

    // Trigger the sound player when the sound is loaded and the scene is zoomed in
    // (definitely not the best to do it in the render method, but whatever)
    if (isLoaded && isInteractive) {
      soundManager.playSound();
    }

    return (
      <SoundPlayerWrapper visible={visible} size={tileSize}>
        <Hash />
        {showLoader && (
          <SpinnerWrapper>
            <Spinner name="wandering-cubes" color={waveColor} />
          </SpinnerWrapper>
        )}
        <Waveform
          id="waveform"
          size={tileSize / 3}
          isInteractive={isInteractive}
          onClick={soundManager.toggleSound}
        />
        <IntroSoundPlayer id="introPlayer" />
      </SoundPlayerWrapper>
    );
  }
}
