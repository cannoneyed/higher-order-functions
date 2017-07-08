import React, { Component, PropTypes as t } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { withProps } from 'recompose'

import sceneManager from 'core/scene'
import hash from 'utils/hash'

import Fade from 'components/Fade'

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
  }

  state = {
    selectedPixel: null,
  }

  componentWillReceiveProps(nextProps) {
    // Only transition the hash when entering the visible state
    if (this.isVisible(nextProps) && !this.isVisible(this.props)) {
      this.setState({ selectedPixel: nextProps.selectedPixel })
    }
  }

  isVisible = props => {
    const { isZoomedIn, isInteractive } = props
    return isZoomedIn && isInteractive
  }

  render() {
    const { selectedPixel } = this.state
    const visible = this.isVisible(this.props)

    return (
      <Fade visible={visible}>
        <HashWrapper>
          <Hash>
            {hash(selectedPixel)}
          </Hash>
        </HashWrapper>
      </Fade>
    )
  }
}

const HashWrapper = styled.div`
  pointer-events: none;
  position: fixed;
  bottom: 50%;
  width: 100%;
  height: 8rem;

  display: flex;
  align-items: center;
  justify-content: center;
`
const Hash = styled.div`
  font-size: 1.5rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
`
