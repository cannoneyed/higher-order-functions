import styled, { css } from 'styled-components'
import soundManager from 'core/sound'

const centered = css`
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

export const IntroSoundPlayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  visibility: hidden;
`

export const SpinnerWrapper = styled.div`
  position: absolute;
  z-index: 200;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const Waveform = styled.div`
  cursor: pointer;
  width: 80%;
  height: ${props => props.size}px;

  opacity: ${props => (props.isInteractive ? 1 : 0)};
  transition: all ${soundManager.loadDelay}ms linear;
`

export const SoundPlayerWrapper = styled.div`
  ${centered};
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  backface-visibility: hidden;
  width: ${props => props.size}px;
  height: ${props => props.size + 1}px;
  z-index: 999;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
