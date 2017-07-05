import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { init, animate } from 'three/scene'

export default class Composition extends Component {
  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.stage)
    init(container)
    animate()
  }
  render() {
    return <Stage ref={ref => (this.stage = ref)} />
  }
}

const Stage = styled.div`
  width: 100%;
  height: 100vh;
  background-color: black;
`
