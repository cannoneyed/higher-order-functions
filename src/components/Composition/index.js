import React, { Component, PropTypes as t } from 'react'
import ReactDOM from 'react-dom'
import { withState } from 'recompose'

import * as scene from 'three/scene'

import { Stage, StageButton, StageWrapper } from './styled-components'

@withState('isActive', 'setIsActive', false)
export default class Composition extends Component {
  static propTypes = {
    isActive: t.bool,
    setIsActive: t.func,
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.stage)
    scene.init(container)
  }

  activate = () => {
    const { setIsActive } = this.props
    setIsActive(true)
    scene.activate()
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
