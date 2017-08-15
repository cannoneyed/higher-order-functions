import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import colors from 'constants/colors'
import sceneManager from 'core/scene'
import hash from 'utils/hash'

import Fade from 'components/Fade'

@observer
export default class TitleComponent extends Component {
  render() {
    const { isZoomedIn, isInteractive, hoveredPixel } = sceneManager
    const visible = !isZoomedIn && isInteractive

    const hashStr = hoveredPixel ? hash(hoveredPixel) : '0000'
    const colorIndex = hoveredPixel ? parseInt(hashStr[0], 16) : 13

    return (
      <Fade visible={visible}>
        <TitleWrapper>
          <Title>
            <Hash colorIndex={colorIndex}>
              {hashStr}
            </Hash>
            <Prompt>/~​‌d‌oglogic: </Prompt>
            <Name>higher or​‌đ​‌er functions</Name>
          </Title>
        </TitleWrapper>
      </Fade>
    )
  }
}

const Prompt = styled.span`
  color: ${colors[1]};
  /* multi-line */
`

const Name = styled.span`
  color: ${colors[0]};
  /* multi-line */
`

const Hash = styled.span`color: ${props => colors[props.colorIndex]};`

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
