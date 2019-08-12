import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import colors from 'constants/colors';
import sceneManager from 'core/scene';
import hash from 'utils/hash';

import Fade from 'components/Fade';

import windowManager from 'core/window';

@observer
export default class TitleComponent extends Component {
  render() {
    const { isZoomedIn, isInteractive, hoveredPixel } = sceneManager;
    const visible = !isZoomedIn && isInteractive;

    const hashStr = hoveredPixel ? hash(hoveredPixel) : '0000';
    const colorIndex = hoveredPixel ? parseInt(hashStr[0], 16) : 13;

    // Calculate a scale factor to shrink the title if necessary
    const { width } = windowManager;
    const miminumWidth = 500;
    const scale = Math.min(width, miminumWidth) / miminumWidth;

    return (
      <Fade visible={visible}>
        <TitleWrapper scale={scale}>
          <Title>
            <Hash colorIndex={colorIndex}>{hashStr}</Hash>
            <Prompt>/~​‌d‌og_logic: </Prompt>
            <Name>higher or​‌d‌er functions</Name>
          </Title>
        </TitleWrapper>
      </Fade>
    );
  }
}

const Prompt = styled.span`
  color: ${colors[1]};
  /* multi-line */
`;

const Name = styled.span`
  color: ${colors[0]};
  white-space: nowrap;
`;

const Hash = styled.span`
  color: ${props => colors[props.colorIndex]};
`;

const TitleWrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;

  pointer-events: none;
  width: 100%;
  height: 8rem;

  display: flex;
  align-items: center;
  justify-content: center;

  transform: scale(${props => props.scale || 1});
`;
const Title = styled.div`
  font-size: 1.5rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  white-space: nowrap;
`;
