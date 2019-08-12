import React, { Component, PropTypes as t } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { withProps } from 'recompose';

import sceneManager from 'core/scene';
import soundManager from 'core/sound';
import hash from 'utils/hash';

import Fade from 'components/Fade';
import Icon from 'components/Icon';

@observer
@withProps(() => ({
  isInteractive: sceneManager.isInteractive,
  isZoomedIn: sceneManager.isZoomedIn,
  selectedPixel: sceneManager.selectedPixel,
}))
export default class HashComponent extends Component {
  static propTypes = {
    isInteractive: t.bool,
    isZoomedIn: t.bool,
    selectedPixel: t.object,
  };

  state = {
    selectedPixel: null,
  };

  componentWillReceiveProps(nextProps) {
    // Only transition the hash when entering the visible state
    if (this.isVisible(nextProps) && !this.isVisible(this.props)) {
      this.setState({ selectedPixel: nextProps.selectedPixel });
    }
  }

  handleDownload = () => {
    const { selectedPixel } = this.state;
    const hashStr = hash(selectedPixel);

    const url = soundManager.getMp3Url(hashStr);

    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  isVisible = props => {
    const { isZoomedIn, isInteractive } = props;
    return isZoomedIn && isInteractive;
  };

  render() {
    const { selectedPixel } = this.state;
    const visible = this.isVisible(this.props);

    return (
      <HashWrapper>
        <Fade visible={visible}>
          <Hash onClick={() => this.handleDownload()}>
            {hash(selectedPixel)}
            <Spacer />
            <Icon type="file-download" />
          </Hash>
        </Fade>
      </HashWrapper>
    );
  }
}

const Spacer = styled.span`
  /* single-line */
  margin-right: 3px;
`;

const HashWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  margin-top: -60px;
`;
const Hash = styled.div`
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
`;
