import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'
import { withState } from 'recompose'

import { init, animate, activate } from 'three/scene'

@withState('isActive', 'setIsActive', false)
export default class Composition extends Component {
  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.stage)
    init(container)
    animate()
  }

  activate = () => {
    const { setIsActive } = this.props
    setIsActive(true)
    activate()
  }

  render() {
    const { isActive } = this.props
    return (
      <StageWrapper>
        <Stage ref={ref => (this.stage = ref)} />
        <StageButton onClick={this.activate} size={128} isActive={isActive} />
      </StageWrapper>
    )
  }
}

const StageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: black;
`

const hover = css`
  background-color: #f42b2e;
  width: ${props => props.size * 1.1}px;
  height: ${props => props.size * 1.1 + 1}px;
  margin-left: -${props => props.size * 1.1 / 2}px;
  margin-top: -${props => props.size * 1.1 / 2 + 1}px;
`

const active = css`
  width: ${props => props.size * 4.5}px;
  height: ${props => props.size * 4.5 + 1}px;
  margin-left: -${props => props.size * 4.5 / 2}px;
  margin-top: -${props => props.size * 4.5 / 2 + 1}px;
`

const StageButton = styled.div`
  backface-visibility: hidden;
  position: fixed;
  cursor: ${props => (props.isActive ? '' : 'pointer')};
  left: 50%;
  top: 50%;
  width: ${props => props.size}px;
  height: ${props => props.size + 1}px;
  margin-left: -${props => props.size / 2}px;
  margin-top: -${props => props.size / 2 + 1}px;
  z-index: 999;

  ${props => (props.isActive ? active : '')};

  &:hover {
    ${props => (props.isActive ? '' : hover)};
  }

  transition: all ${props => (props.isActive ? 1200 : 220)}ms
    cubic-bezier(0.000, 1.020, 0.510, 0.950);
`

const Stage = styled.div`
  width: 100%;
  height: 100%;
`
