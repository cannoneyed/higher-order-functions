import React, { Component, PropTypes as t } from 'react'
import Transition from 'react-transition-group/Transition'

export default class Fade extends Component {
  static propTypes = {
    children: t.node,
    duration: t.number,
    visible: t.bool,
  }

  static defaultProps = {
    duration: 300,
  }

  render() {
    const { children, duration, visible } = this.props

    const defaultStyle = {
      transition: `opacity ${duration}ms ease-in-out`,
      opacity: 0,
    }

    const transitionStyles = {
      entering: { opacity: 1 },
      entered: { opacity: 1 },
    }

    return (
      <Transition in={visible} timeout={duration}>
        {state =>
          React.cloneElement(children, {
            style: {
              ...defaultStyle,
              ...transitionStyles[state],
            },
          })}
      </Transition>
    )
  }
}
