import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import sceneManager from 'core/scene'

import Fade from 'components/Fade'

@observer
export default class TitleComponent extends Component {
  render() {
    const { isZoomedIn, isInteractive } = sceneManager
    const visible = !isZoomedIn && isInteractive

    return (
      <Fade visible={visible}>
        <TitleWrapper>
          <Title>/doglogic: higher order functions</Title>
        </TitleWrapper>
      </Fade>
    )
  }
}

const TitleWrapper = styled.div`
  pointer-events: none;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 8rem;

  display: flex;
  align-items: center;
  justify-content: center;
`
const Title = styled.div`
  font-size: 1.5rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
`
